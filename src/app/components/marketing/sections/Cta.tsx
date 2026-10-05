import Link from "next/link";
import { ArrowRight } from "../Icons";

export default function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="glow-brand -bottom-72 opacity-80" aria-hidden="true" />
          <div className="relative">
            <h2 className="section-title text-gradient mx-auto max-w-2xl">Your next presentation is one topic away</h2>
            <p className="lead mx-auto mt-4 max-w-lg">
              Create an account and have your first deck in minutes. No credit card needed.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up" className="btn btn-primary btn-lg w-full sm:w-auto">
                Get started free <ArrowRight className="size-4" />
              </Link>
              <Link href="/sign-in" className="btn btn-ghost btn-lg w-full sm:w-auto">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}