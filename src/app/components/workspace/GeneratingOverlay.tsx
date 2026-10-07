"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

const MESSAGES = ["Writing your slides…", "Choosing the best photos…", "Putting it all together…"];

function Overlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((n) => Math.min(n + 1, MESSAGES.length - 1)), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-bg/85 px-6 backdrop-blur-md"
    >
      <div className="text-center">
        <div className="mx-auto size-12 animate-spin rounded-full border-2 border-white/10 border-t-brand-soft" />
        <p className="mt-6 text-lg font-medium">{MESSAGES[index]}</p>
        <p className="mt-2 text-sm text-muted">This usually takes 10 to 30 seconds. Please keep this page open.</p>
      </div>
    </div>
  );
}

/** Must be rendered inside the <form> it watches. */
export function GeneratingOverlay() {
  const { pending } = useFormStatus();
  return pending ? <Overlay /> : null;
}