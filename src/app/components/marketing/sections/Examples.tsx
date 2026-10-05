
import SectionHeading from "../SectionHeading";
import { MiniSlide, type SlideTheme } from "../mockups/MiniSlide";
import { THEMES } from "../mockups/themes";

type Example = {
  kind: "title" | "content";
  title: string;
  lines?: string[];
  byline?: string;
  flip?: boolean;
  theme: SlideTheme;
  caption: string;
  image?: string;
  imageAlt?: string;
};

const EXAMPLES: Example[] = [
  {
    kind: "title",
    title: "",
    byline: "Presented by Alex Morgan",
    theme: THEMES.violet,
    caption: "Title slide · photo background",
    image: "/images/ai.webp",
    imageAlt: "Slide showing an ai generated image of a robot head",
  },
  {
    kind: "content",
    title: "Engineerring Solutions",
    lines: ["Engineers solve problems", "They design and build things", "They work in teams"],
    theme: THEMES.forest,
    caption: "Content slide · image on the right",
    image: "/images/eng.webp",
    imageAlt: "Engineering solutions",
  },
  {
    kind: "content",
    title: "Ecology Demographics",
    lines: ["Ecology is a growing field", "More students are studying it", "The job market is expanding"],
    flip: true,
    theme: THEMES.ocean,
    caption: "Content slide · image on the left",
    image: "/images/green.webp",
    imageAlt: "Ecology demographics",
  },
  {
    kind: "content",
    title: "Quarterly Marketing Review",
    lines: ["Campaign results", "Audience growth", "Priorities for next quarter"],
    theme: THEMES.paper,
    caption: "Light background · any colour works",
    image: "/images/marketing.webp",
    imageAlt: "Quarterly marketing review",
  },
];

export default function Examples() {
  return (
    <section id="examples" className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading badge="Examples" title="See what a finished deck looks like">
          Photos sit beside the text, the title slide gets a full background image, and the colours and fonts are yours
          to choose.
        </SectionHeading>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {EXAMPLES.map(({ caption, ...slide }) => (
            <figure key={slide.title} className="card p-3 sm:p-4">
              <div className="overflow-hidden rounded-xl ring-1 ring-line">
                <MiniSlide {...slide} />
              </div>
              <figcaption className="px-1 pb-1 pt-3 text-sm text-muted">{caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-subtle">Illustrative samples</p>
      </div>
    </section>
  );
}
