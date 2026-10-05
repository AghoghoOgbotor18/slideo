import Link from "next/link";
import { Logo } from "./Logo";
import { APP_NAME, APP_TAGLINE, FOOTER_LINKS } from "../../lib/constants";

export function Footer() {
    return (
        <footer className="relative border-t border-line bg-surface/40">
        <div className="container-page py-14 md:py-16">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
                <Logo />
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{APP_TAGLINE}</p>
            </div>

            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                <div key={title}>
                <h3 className="text-sm font-medium text-fg">{title}</h3>
                <ul className="mt-4 space-y-3">
                    {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-sm text-muted transition hover:text-fg">
                        {link.label}
                        </Link>
                    </li>
                    ))}
                </ul>
                </div>
            ))}
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p>
                Powered by Gemini · Photos from{" "}
                <a
                href="https://unsplash.com/?utm_source=deckforge&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition hover:text-fg"
                >
                Unsplash
                </a>
            </p>
            </div>
        </div>
        </footer>
    );
}