const ITEMS = ["Gemini", "Unsplash", "PowerPoint", "Keynote", "Google Slides"];

export default function PoweredBy() {
  return (
    <section aria-label="Technology" className="py-14 sm:py-20">
      <div className="container-page text-center">
        <p className="text-sm text-subtle">AI by Gemini, photos by Unsplash, and files that open in the tools you already use</p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xl font-semibold tracking-tight text-white/30 sm:gap-x-14 sm:text-2xl">
          {ITEMS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}