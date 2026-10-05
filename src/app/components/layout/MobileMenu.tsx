"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { label: string; href: string };

export function MobileMenu({ links }: { links: NavLink[] }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const mq = window.matchMedia("(min-width: 768px)");
        const onResize = () => mq.matches && setOpen(false);

        window.addEventListener("keydown", onKey);
        mq.addEventListener("change", onResize);
        return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
        mq.removeEventListener("change", onResize);
        };
    }, [open]);

    const close = () => setOpen(false);

    return (
        <div className="md:hidden">
        <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-line bg-white/5"
        >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            {open ? (
                <path d="M4 4l10 10M14 4L4 14" />
            ) : (
                <path d="M3 6h12M3 12h12" />
            )}
            </svg>
        </button>

        {/* absolute (not fixed): the header's backdrop-blur would trap a fixed child */}
        {open && (
            <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto bg-bg/95 backdrop-blur-xl"
            >
            <ul className="container-page flex flex-col gap-1 pt-6">
                {links.map((link) => (
                <li key={link.href}>
                    <Link
                    href={link.href}
                    onClick={close}
                    className="block rounded-xl px-4 py-4 text-lg text-fg/90 transition hover:bg-white/5"
                    >
                    {link.label}
                    </Link>
                </li>
                ))}
            </ul>
            <div className="container-page mt-6 grid gap-3 border-t border-line pt-6">
                <Link href="/sign-in" onClick={close} className="btn btn-ghost btn-lg">
                Sign in
                </Link>
                <Link href="/sign-up" onClick={close} className="btn btn-primary btn-lg">
                Get started free
                </Link>
            </div>
            </div>
        )}
        </div>
    );
}