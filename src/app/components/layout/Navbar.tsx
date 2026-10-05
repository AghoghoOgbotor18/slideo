import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "../../lib/constants";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-line bg-bg/70 backdrop-blur-xl">
        <nav aria-label="Main" className="container-page flex h-16 items-center justify-between gap-4">
            <Logo />

            <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
                <li key={link.href}>
                <Link
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-fg"
                >
                    {link.label}
                </Link>
                </li>
            ))}
            </ul>

            <div className="flex items-center gap-2">
            <Link href="/sign-in" className="btn btn-ghost hidden md:inline-flex">
                Sign in
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
                Get started
            </Link>
            <MobileMenu links={NAV_LINKS} />
            </div>
        </nav>
        </header>
    );
}