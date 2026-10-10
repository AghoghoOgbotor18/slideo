"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "../lib/supabase/server";
import { FONTS, LIMITS } from "../lib/presentation";
import { THEME_KEYS } from "../lib/themes";
import { BUCKET, storedPath } from "../lib/storage";

const MAX_UPLOAD = 4 * 1024 * 1024;
const MIN_SLIDES = 3; // title + one content slide + thank-you
const UUID = z.string().uuid();
const isFixed = (type: string) => type === "title" || type === "thanks";

/** Signed-in user who owns this presentation, or they get sent away. */
async function owner(presentationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("presentations")
    .select("id")
    .eq("id", presentationId)
    .eq("user_id", user.id)
    .single();
  if (!data) redirect("/workspace");

  return { supabase, user };
}

/** Keeps slide_count honest and refreshes the pages that show the deck. */
async function finish(supabase: SupabaseClient, presentationId: string) {
  const { count } = await supabase
    .from("slides")
    .select("id", { count: "exact", head: true })
    .eq("presentation_id", presentationId);
  await supabase.from("presentations").update({ slide_count: count ?? MIN_SLIDES }).eq("id", presentationId);

  revalidatePath(`/workspace/${presentationId}`);
  revalidatePath(`/workspace/${presentationId}/edit`);
  revalidatePath("/workspace");
}

async function removeStored(supabase: SupabaseClient, url: string | null) {
  const path = storedPath(url);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

// ---------- save text, notes, layout and image of one slide ----------
const saveSchema = z.object({
  id: UUID,
  presentation_id: UUID,
  title: z.string().trim().min(1).max(120),
  bullets: z.string().max(3000).default(""), // the thank-you slide has no bullets box
  notes: z.string().max(3000).default(""), // the title and thank-you slides have no notes box
  layout: z.enum(["background", "image-left", "image-right", "text-only"]).default("text-only"),
});

export async function saveSlide(formData: FormData) {
  const parsed = saveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // never fail silently: tell the person something went wrong
    const pid = String(formData.get("presentation_id") ?? "");
    redirect(UUID.safeParse(pid).success ? `/workspace/${pid}/edit?error=invalid` : "/workspace");
  }
  const { id, presentation_id, title, bullets, notes } = parsed.data;

  const { supabase, user } = await owner(presentation_id);

  const { data: slide } = await supabase
    .from("slides")
    .select("id, type, image_url")
    .eq("id", id)
    .eq("presentation_id", presentation_id)
    .single();
  if (!slide) return;

  let layout: string = slide.type === "title" ? "background" : slide.type === "thanks" ? "text-only" : parsed.data.layout;

  const update: Record<string, unknown> = {
    title,
    notes: slide.type === "title" || slide.type === "thanks" ? "" : notes,
    bullets:
      slide.type === "thanks"
        ? []
        : bullets
            .split("\n")
            .map((b) => b.trim().slice(0, 200))
            .filter(Boolean)
            .slice(0, 6),
  };

  if (slide.type !== "thanks") {
    const file = formData.get("image");
    const wantsRemove = formData.get("remove_image") === "on";

    if (file instanceof File && file.size > 0) {
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (!okType || file.size > MAX_UPLOAD) redirect(`/workspace/${presentation_id}/edit?error=upload`);

      const path = `${user.id}/${id}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) {
        console.error("[saveSlide] upload", error.message);
        redirect(`/workspace/${presentation_id}/edit?error=upload`);
      }

      await removeStored(supabase, slide.image_url); // don't leave the old upload behind
      update.image_url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      update.image_credit = null;
      update.image_keyword = null;
      if (layout === "text-only") layout = "image-right";
    } else if (wantsRemove && slide.image_url) {
      await removeStored(supabase, slide.image_url);
      update.image_url = null;
      update.image_credit = null;
      if (slide.type !== "title") layout = "text-only";
    }
  }

  update.layout = layout;
  await supabase.from("slides").update(update).eq("id", id);
  await finish(supabase, presentation_id);
}

// ---------- move a slide up or down ----------
export async function moveSlide(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const presentationId = String(formData.get("presentation_id") ?? "");
  const step = formData.get("dir") === "up" ? -1 : 1;
  if (!UUID.safeParse(id).success || !UUID.safeParse(presentationId).success) return;

  const { supabase } = await owner(presentationId);
  const { data } = await supabase
    .from("slides")
    .select("id, type, position")
    .eq("presentation_id", presentationId)
    .order("position");

  const list = data ?? [];
  const i = list.findIndex((s) => s.id === id);
  const a = list[i];
  const b = list[i + step];
  if (!a || !b || isFixed(a.type) || isFixed(b.type)) return; // the title and thank-you slides stay put

  await supabase.from("slides").update({ position: b.position }).eq("id", a.id);
  await supabase.from("slides").update({ position: a.position }).eq("id", b.id);
  await finish(supabase, presentationId);
}

// ---------- delete a slide ----------
export async function deleteSlide(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const presentationId = String(formData.get("presentation_id") ?? "");
  if (!UUID.safeParse(id).success || !UUID.safeParse(presentationId).success) return;

  const { supabase } = await owner(presentationId);
  const { data } = await supabase
    .from("slides")
    .select("id, type, image_url")
    .eq("presentation_id", presentationId);

  const list = data ?? [];
  const target = list.find((s) => s.id === id);
  if (!target || isFixed(target.type) || list.length <= MIN_SLIDES) return;

  await removeStored(supabase, target.image_url);
  await supabase.from("slides").delete().eq("id", id);
  await finish(supabase, presentationId);
}

// ---------- add a blank slide after another one ----------
export async function addSlide(formData: FormData) {
  const after = String(formData.get("after") ?? "");
  const presentationId = String(formData.get("presentation_id") ?? "");
  if (!UUID.safeParse(after).success || !UUID.safeParse(presentationId).success) return;

  const { supabase } = await owner(presentationId);
  const { data } = await supabase
    .from("slides")
    .select("id, type, position")
    .eq("presentation_id", presentationId)
    .order("position");

  const list = data ?? [];
  if (list.length >= LIMITS.slides.max) return;

  const lastBeforeThanks = list.map((s) => s.type).lastIndexOf("content");
  const at = Math.min(list.findIndex((s) => s.id === after), Math.max(lastBeforeThanks, list.length - 2));
  const prev = list[at];
  const next = list[at + 1];
  if (!prev) return;

  // positions are decimals, so a new slide fits between two others without renumbering
  const position = next ? (prev.position + next.position) / 2 : prev.position + 1;

  await supabase.from("slides").insert({
    presentation_id: presentationId,
    position,
    type: "content",
    title: "New slide",
    bullets: ["Add your first point"],
    notes: "",
    layout: "text-only",
  });
  await finish(supabase, presentationId);
}

// ---------- change theme, font, size and background ----------
const styleSchema = z.object({
  presentation_id: UUID,
  theme: z.enum(THEME_KEYS),
  font_family: z.enum(FONTS),
  font_size: z.coerce.number().int().min(LIMITS.fontSize.min).max(LIMITS.fontSize.max),
  bg_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function updateStyle(formData: FormData) {
  const parsed = styleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { presentation_id, ...style } = parsed.data;

  const { supabase } = await owner(presentation_id);
  await supabase.from("presentations").update(style).eq("id", presentation_id);

  revalidatePath(`/workspace/${presentation_id}`);
  revalidatePath(`/workspace/${presentation_id}/edit`);
}