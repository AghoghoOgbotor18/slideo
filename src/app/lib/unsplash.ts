import type { ImageCredit } from "./slides";

// Unsplash asks for your app name in credit links. Change this once you pick a final name.
const UTM = "utm_source=deckforge&utm_medium=referral";

export type Photo = { id: string; url: string; thumb: string; credit: ImageCredit };

type UnsplashPhoto = {
  id: string;
  urls: { raw: string; small: string };
  user: { name: string; links: { html: string } };
  links: { download_location: string };
};

function authHeaders() {
  return { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, "Accept-Version": "v1" };
}

export async function searchPhotos(
  query: string,
  perPage = 5,
  orientation: "landscape" | "portrait" | "squarish" = "portrait"
): Promise<Photo[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.warn("[unsplash] UNSPLASH_ACCESS_KEY is not set, so slides will have no photos");
    return [];
  }

  try {
    const params = new URLSearchParams({ query, per_page: String(perPage), orientation, content_filter: "high" });
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: authHeaders(),
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[unsplash]", res.status, await res.text().then((t) => t.slice(0, 200)));
      return [];
    }

    const data = (await res.json()) as { results: UnsplashPhoto[] };
    return data.results.map((p) => ({
      id: p.id,
      url: p.urls.raw,
      thumb: p.urls.small,
      credit: {
        name: p.user.name,
        link: `${p.user.links.html}?${UTM}`,
        downloadLocation: p.links.download_location,
      },
    }));
  } catch (e) {
    console.error("[unsplash]", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Unsplash asks apps to ping this when a photo is actually used. */
export async function trackDownload(downloadLocation: string) {
  if (!downloadLocation.startsWith("https://api.unsplash.com/")) return; // never send our key elsewhere
  try {
    await fetch(downloadLocation, { headers: authHeaders() });
  } catch {
    // not important enough to fail anything
  }
}