type EmptyStateProps = {
  visible: boolean;
};

export function EmptyState({ visible }: EmptyStateProps) {
  if (!visible) return null;
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 px-6 py-8 text-center text-sm text-slate-400 shadow-inner shadow-white/5">
        <p>No apps matched your search.</p>
        <p className="mt-2 text-xs text-slate-500">
          Try a different keyword or reset your filters.
        </p>
      </div>
    </div>
  );
}
