import SectionHeading from "../SectionHeading";
import { Book, Briefcase, Cap, Rocket } from "../Icons";

const CASES = [
  { icon: Cap, title: "Students", text: "Turn a topic or assignment into a clean deck, then tweak it to fit your brief." },
  { icon: Book, title: "Teachers", text: "Prepare lesson slides in minutes and edit them to suit your class." },
  { icon: Briefcase, title: "Professionals", text: "Get a structured first draft for a meeting or report, ready to refine." },
  { icon: Rocket, title: "Founders", text: "Sketch out a pitch or product overview before polishing it your way." },
];

export default function UseCases() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading badge="Who it's for" title="Made for anyone who needs to present" />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card p-6 transition hover:border-white/15">
              <span className="grid size-11 place-items-center rounded-xl bg-brand/15 text-brand-soft">
                <Icon />
              </span>
              <h3 className="mt-5 text-lg font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}