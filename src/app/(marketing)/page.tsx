export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="glow-brand -top-40" />
      <div className="container-page relative grid min-h-[70dvh] place-items-center py-24 text-center">
        <div>
          <span className="badge">Placeholder</span>
          <h1 className="display text-gradient mt-6">Marketing page coming next</h1>
          <p className="lead mx-auto mt-5 max-w-xl">Layout, navbar and footer are in place.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a className="btn btn-primary btn-lg">Primary</a>
            <a className="btn btn-ghost btn-lg">Ghost</a>
          </div>
        </div>
      </div>
    </section>
  );
}