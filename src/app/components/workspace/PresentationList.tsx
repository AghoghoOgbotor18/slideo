import Link from "next/link";
import { Download, Pencil, RotateCw, Trash2 } from "lucide-react";
import { retryGeneration, deletePresentation } from "../../actions/presentations";
import { SubmitButton } from "../ui/SubmitButton";
import { GeneratingOverlay } from "./GeneratingOverlay";

type Item = {
  id: string;
  topic: string;
  status: string;
  slide_count: number;
  created_at: string;
  updated_at: string;
};

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-white/10 text-muted" },
  generating: { label: "Generating", className: "bg-brand/20 text-brand-soft" },
  ready: { label: "Ready", className: "bg-emerald-500/15 text-emerald-300" },
  failed: { label: "Failed", className: "bg-red-500/15 text-red-300" },
};

const STUCK_MS = 3 * 60 * 1000; // a request that was cut off leaves the status on "generating" forever
const action = "btn btn-ghost h-9 px-3.5";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PresentationList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">No presentations yet. Create your first one above.</div>
    );
  }

  const now = Date.now();

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const stuck = item.status === "generating" && now - new Date(item.updated_at).getTime() > STUCK_MS;
        const failed = item.status === "failed" || stuck;
        const ready = item.status === "ready";
        const status = STATUS[failed ? "failed" : item.status] ?? STATUS.draft;

        return (
          <li key={item.id} className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/workspace/${item.id}`} className="min-w-0 flex-1 transition hover:opacity-80">
                <p className="truncate font-medium">{item.topic}</p>
                <p className="mt-1 text-xs text-subtle">
                  {item.slide_count} slides · {formatDate(item.created_at)}
                </p>
              </Link>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${status.className}`}>{status.label}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              {ready && (
                <>
                  <Link href={`/workspace/${item.id}/edit`} className={action}>
                    <Pencil className="size-4" /> Edit
                  </Link>
                  <a href={`/workspace/${item.id}/download`} download className={action}>
                    <Download className="size-4" /> Download
                  </a>
                </>
              )}

              {failed && (
                <form action={retryGeneration}>
                  <GeneratingOverlay />
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton className="btn btn-primary h-9 px-3.5" pendingText="Retrying…">
                    <RotateCw className="size-4" /> Retry
                  </SubmitButton>
                </form>
              )}

              <details className="relative ml-auto">
                <summary
                  className={`${action} cursor-pointer list-none text-red-300 [&::-webkit-details-marker]:hidden`}
                >
                  <Trash2 className="size-4" /> Delete
                </summary>
                <form
                  action={deletePresentation}
                  className="absolute right-0 z-10 mt-2 w-60 rounded-xl border border-line bg-surface-2 p-3 shadow-xl"
                >
                  <input type="hidden" name="id" value={item.id} />
                  <p className="text-xs text-muted">Delete this presentation and its slides for good?</p>
                  <SubmitButton className="btn btn-ghost mt-2 w-full text-red-300" pendingText="Deleting…">
                    Yes, delete
                  </SubmitButton>
                </form>
              </details>
            </div>
          </li>
        );
      })}
    </ul>
  );
}