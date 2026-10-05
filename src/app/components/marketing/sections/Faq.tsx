import { Plus } from "../Icons";

const FAQS = [
  {
    q: "Is it free?",
    a: "Yes. While we're in early access, creating and downloading presentations is free.",
  },
  {
    q: "Can I edit the slides after they're generated?",
    a: "Absolutely. You can change any text, swap photos, drag slides into a new order, and preview everything before you download.",
  },
  {
    q: "Which apps open the downloaded file?",
    a: "The file is a standard .pptx, so it opens in PowerPoint, Keynote, Google Slides, and LibreOffice.",
  },
  {
    q: "How many slides can I create?",
    a: "Between 5 and 20. The first slide is always the title, the second is the introduction, the second to last is the conclusion, and the last is a thank-you slide.",
  },
  {
    q: "Where do the photos come from?",
    a: "From Unsplash. Photographers are credited on the slide, and you can swap any photo for another in the editor.",
  },
  {
    q: "Why is the font list limited?",
    a: "A .pptx file doesn't embed fonts, so we offer ones installed on most Windows and Mac computers. That way your deck looks the same wherever it's opened.",
  },
  {
    q: "Are my presentations private?",
    a: "Yes. Each presentation belongs to your account and only you can see it.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <span className="badge">FAQ</span>
          <h2 className="section-title text-gradient mt-5">Questions, answered</h2>
          <p className="lead mt-4">Can't find what you're looking for? Create an account and try it. It takes a minute.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="group card px-5 open:bg-white/[0.04]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-5 shrink-0 text-muted transition duration-200 group-open:rotate-45" />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}