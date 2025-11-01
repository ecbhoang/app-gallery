type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mb-6 w-full max-w-4xl rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-50 shadow-inner shadow-rose-500/10">
      <p className="font-medium">Unable to load some data</p>
      <p className="text-xs text-rose-200/80">{message}</p>
    </div>
  );
}
