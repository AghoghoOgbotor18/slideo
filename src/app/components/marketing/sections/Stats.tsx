const STATS = [
  { value: "5–20", label: "Slides per deck" },
  { value: "100%", label: "Editable after generating" },
  { value: ".pptx", label: "Opens in PowerPoint" },
  { value: "Any screen", label: "Phone, tablet, desktop" },
];

export default function Stats() {
  return (
    <section aria-label="Highlights" className="py-10 sm:py-16">
      <div className="container-page grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-6 text-center">
            <p className="text-gradient-brand text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</p>
            <p className="mt-1.5 text-xs text-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}