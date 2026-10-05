import Link from "next/link";
import { APP_NAME } from "../../lib/constants";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${APP_NAME} home`} className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="7" y="3" width="18" height="14" rx="4" fill="#7c5cff" opacity="0.45" />
        <rect x="3" y="9" width="18" height="14" rx="4" fill="#8f73ff" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}