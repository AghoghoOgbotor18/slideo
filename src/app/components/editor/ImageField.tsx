"use client";

import { useEffect, useState } from "react";

/** Crops the photo to the slide's image box and shrinks it, so phone photos stay small. */
async function cropToRatio(file: File, ratio: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const width = ratio >= 1 ? 1600 : 1000;
  const height = Math.round(width / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  const scale = Math.max(width / bitmap.width, height / bitmap.height); // fill the box, like object-fit: cover
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export image"))), "image/jpeg", 0.85)
  );
}

export function ImageField({ ratio }: { ratio: number }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setError(null);
    if (!file) {
      setPreview(null);
      return;
    }

    try {
      const blob = await cropToRatio(file, ratio);
      const data = new DataTransfer();
      data.items.add(new File([blob], "slide.jpg", { type: "image/jpeg" }));
      input.files = data.files; // the form now submits the cropped copy
      setPreview(URL.createObjectURL(blob));
    } catch {
      input.value = "";
      setPreview(null);
      setError("We couldn't read that image. Try a JPG, PNG or WebP.");
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-fg hover:file:bg-white/15"
      />
      {preview && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-16 rounded-lg ring-1 ring-line" />
          <p className="text-xs text-subtle">Cropped to fit the slide. Press Save slide to use it.</p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}