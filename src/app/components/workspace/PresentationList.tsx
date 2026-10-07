type Item = {
  id: string;
  topic: string;
  status: string;
  slide_count: number;
  created_at: string;
};

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-white/10 text-muted" },
  generating: { label: "Generating", className: "bg-brand/20 text-brand-soft" },
  ready: { label: "Ready", className: "bg-emerald-500/15 text-emerald-300" },
  failed: { label: "Failed", className: "bg-red-500/15 text-red-300" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PresentationList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-muted">
        No presentations yet. Create your first one above.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const status = STATUS[item.status] ?? STATUS.draft;
        return (
          <li key={item.id} className="card flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.topic}</p>
              <p className="mt-1 text-xs text-subtle">
                {item.slide_count} slides · {formatDate(item.created_at)}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${status.className}`}>{status.label}</span>
          </li>
        );
      })}
    </ul>
  );
}