"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { createPresentationSchema } from "../lib/presentation";
import { generateDeck } from "../lib/grok";
import { searchPhotos, trackDownload, type Photo } from "../lib/unsplash";

type GenerateInput = { topic: string; author_name: string; slide_count: number };

/** Writes the slides with Gemini, finds photos on Unsplash, and saves everything. Throws on failure. */
async function runGeneration(supabase: SupabaseClient, presentationId: string, input: GenerateInput) {
  const deck = await generateDeck(input.topic, input.slide_count);

  // index 0 is the cover photo, the rest line up with deck.slides
  const keywords = [deck.title_image_keyword, ...deck.slides.map((s) => s.image_keyword?.trim() || null)];
  const results = await Promise.all(
    keywords.map((k, i) => (k ? searchPhotos(k, 5, i === 0 ? "landscape" : "portrait") : Promise.resolve([] as Photo[])))
  );

  // never use the same photo twice in one deck
  const used = new Set<string>();
  const picks = results.map((list) => {
    const photo = list.find((p) => !used.has(p.id)) ?? null;
    if (photo) used.add(photo.id);
    return photo;
  });

  const n = deck.slides.length;
  let imageSlides = 0;

  const rows = [
    {
      presentation_id: presentationId,
      position: 0,
      type: "title",
      title: deck.deck_title,
      bullets: [input.author_name],
      notes: "",
      layout: "background",
      image_url: picks[0]?.url ?? null,
      image_keyword: keywords[0],
      image_credit: picks[0]?.credit ?? null,
    },
    ...deck.slides.map((s, i) => {
      const photo = picks[i + 1];
      const layout = photo ? (imageSlides++ % 2 === 0 ? "image-right" : "image-left") : "text-only";
      return {
        presentation_id: presentationId,
        position: i + 1,
        type: i === 0 ? "intro" : i === n - 1 ? "conclusion" : "content",
        title: s.title.trim(),
        bullets: s.bullets.map((b) => b.trim()).filter(Boolean).slice(0, 6),
        notes: s.notes.trim(),
        layout,
        image_url: photo?.url ?? null,
        image_keyword: keywords[i + 1],
        image_credit: photo?.credit ?? null,
      };
    }),
    {
      presentation_id: presentationId,
      position: n + 1,
      type: "thanks",
      title: "Thank You",
      bullets: [],
      notes: "",
      layout: "text-only",
      image_url: null,
      image_keyword: null,
      image_credit: null,
    },
  ];

  await supabase.from("slides").delete().eq("presentation_id", presentationId); // clean slate when retrying
  const { error } = await supabase.from("slides").insert(rows);
  if (error) throw new Error(`Saving slides failed: ${error.message}`);

  await supabase
    .from("presentations")
    .update({ status: "ready", updated_at: new Date().toISOString() })
    .eq("id", presentationId);

  // Unsplash asks to be told when a photo is used. Done after the response is sent.
  after(() => Promise.all(picks.filter((p): p is Photo => !!p).map((p) => trackDownload(p.credit.downloadLocation))));
}

function failureInfo(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  console.error("[generate]", message);
  const code = message.includes("Gemini 429") ? "ai_busy" : "generate_failed";
  // In development only, also pass the real error text to the page so it's easy to see.
  const detail = process.env.NODE_ENV === "development" ? `&detail=${encodeURIComponent(message.slice(0, 400))}` : "";
  return `${code}${detail}`;
}

export async function createPresentation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const parsed = createPresentationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/workspace?error=invalid_form");

  // simple protection for your AI quota: 10 presentations per hour per person
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("presentations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if ((count ?? 0) >= 10) redirect("/workspace?error=rate_limit");

  const { data: presentation, error } = await supabase
    .from("presentations")
    .insert({ user_id: user.id, ...parsed.data, status: "generating" })
    .select("id")
    .single();

  if (error || !presentation) {
    console.error("[createPresentation]", { code: error?.code, message: error?.message });
    redirect("/workspace?error=save_failed");
  }

  let failure: string | null = null;
  try {
    await runGeneration(supabase, presentation.id, parsed.data);
  } catch (e) {
    failure = failureInfo(e);
    await supabase.from("presentations").update({ status: "failed" }).eq("id", presentation.id);
  }

  // The failed presentation is kept, so the person can retry from its page.
  redirect(failure ? `/workspace/${presentation.id}?error=${failure}` : `/workspace/${presentation.id}`);
}

export async function retryGeneration(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: presentation } = await supabase
    .from("presentations")
    .select("topic, author_name, slide_count")
    .eq("id", id)
    .single();
  if (!presentation) redirect("/workspace");

  await supabase.from("presentations").update({ status: "generating" }).eq("id", id);

  let failure: string | null = null;
  try {
    await runGeneration(supabase, id, presentation);
  } catch (e) {
    failure = failureInfo(e);;
    await supabase.from("presentations").update({ status: "failed" }).eq("id", id);
  }

  redirect(failure ? `/workspace/${id}?error=${failure}` : `/workspace/${id}`);
}