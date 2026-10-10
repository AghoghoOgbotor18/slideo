"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/server";
import { createPresentationSchema } from "../lib/presentation";
import { generateDeck } from "../lib/grok";
import { searchPhotos, trackDownload, type Photo } from "../lib/unsplash";
import { BUCKET, storedPath } from "../lib/storage";

type GenerateInput = { topic: string; author_name: string; slide_count: number };

const MAX_PER_HOUR = 10;

/** Counts every generation attempt (new or retry) in the last hour. Returns false when the limit is reached. */
async function allowGeneration(supabase: SupabaseClient, userId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("generation_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_HOUR) return false;
  await supabase.from("generation_log").insert({ user_id: userId });
  return true;
}

/** Grok sometimes fails once (bad JSON, a busy moment) and works the second time, so try twice. */
async function withRetry<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (first) {
    const message = first instanceof Error ? first.message : String(first);
    if (/\b(401|403)\b/.test(message)) throw first; // a bad key won't fix itself
    console.error("[generate] first try failed, retrying:", message);
    await new Promise((r) => setTimeout(r, 1500));
    return await fn();
  }
}

/** Writes the slides with Grok, finds photos on Unsplash, and saves everything. Throws on failure. */
async function runGeneration(supabase: SupabaseClient, presentationId: string, input: GenerateInput) {
  const wanted = Math.max(1, input.slide_count - 2); // everything except the title and thank-you slides
  const deck = await withRetry(() => generateDeck(input.topic, input.slide_count));
  const content = deck.slides.slice(0, wanted);
  if (content.length === 0) throw new Error("Grok returned no usable slides");

  // index 0 is the cover photo, the rest line up with content
  const keywords = [deck.title_image_keyword, ...content.map((s) => s.image_keyword?.trim() || null)];
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

  const n = content.length;
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
    ...content.map((s, i) => {
      const photo = picks[i + 1];
      const layout = photo ? (imageSlides++ % 2 === 0 ? "image-right" : "image-left") : "text-only";
      return {
        presentation_id: presentationId,
        position: i + 1,
        type: i === 0 ? "intro" : i === n - 1 ? "conclusion" : "content",
        title: s.title.trim(),
        bullets: s.bullets.map((b) => b.trim()).filter(Boolean).slice(0, 6),
        notes: (s.notes ?? "").trim(),
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

  // Fewer slides than asked for? Say so instead of failing.
  const notice =
    n < wanted
      ? `This topic only had enough to say for ${rows.length} slides, so we made ${rows.length} instead of ${input.slide_count} rather than padding it with filler. For a longer deck, try a broader topic.`
      : null;

  const { error: updateError } = await supabase
    .from("presentations")
    .update({ status: "ready", slide_count: rows.length, notice, updated_at: new Date().toISOString() })
    .eq("id", presentationId);
  if (updateError) throw new Error(`Updating presentation failed: ${updateError.message}`);

  // Unsplash asks to be told when a photo is used. Done after the response is sent.
  after(() => Promise.all(picks.filter((p): p is Photo => !!p).map((p) => trackDownload(p.credit.downloadLocation))));
}

function failureInfo(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  console.error("[generate]", message);
  const code = /\b429\b|\b503\b|overloaded|rate.?limit/i.test(message) ? "ai_busy" : "generate_failed";
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

  if (!(await allowGeneration(supabase, user.id))) redirect("/workspace?error=rate_limit");

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

  // The failed presentation is kept, so the person can retry from its page or the list.
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
    .eq("user_id", user.id)
    .single();
  if (!presentation) redirect("/workspace");

  if (!(await allowGeneration(supabase, user.id))) redirect(`/workspace/${id}?error=rate_limit`);

  await supabase
    .from("presentations")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", id);

  let failure: string | null = null;
  try {
    await runGeneration(supabase, id, presentation);
  } catch (e) {
    failure = failureInfo(e);
    await supabase.from("presentations").update({ status: "failed" }).eq("id", id);
  }

  redirect(failure ? `/workspace/${id}?error=${failure}` : `/workspace/${id}`);
}

export async function deletePresentation(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: own } = await supabase.from("presentations").select("id").eq("id", id).eq("user_id", user.id).single();
  if (own) {
    const { data: imgs } = await supabase.from("slides").select("image_url").eq("presentation_id", id);
    const paths = (imgs ?? []).map((r) => storedPath(r.image_url)).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from("slides").delete().eq("presentation_id", id);
    await supabase.from("presentations").delete().eq("id", id).eq("user_id", user.id);
  }

  revalidatePath("/workspace");
  redirect("/workspace");
}