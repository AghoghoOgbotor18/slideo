export const BUCKET = "slide-images";

/** The file path inside our bucket for an image we stored. Returns null for Unsplash images. */
export function storedPath(url: string | null) {
  if (!url) return null;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}