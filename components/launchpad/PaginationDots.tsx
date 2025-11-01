import clsx from "clsx";

type PaginationDotsProps = {
  currentPage: number;
  totalPages: number;
  onNavigate: (page: number) => void;
  hidden?: boolean;
};

export function PaginationDots({
  currentPage,
  totalPages,
  onNavigate,
  hidden,
}: PaginationDotsProps) {
  if (hidden) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onNavigate(index)}
          className={clsx(
            "h-2 rounded-full transition-all duration-300",
            index === currentPage
              ? "w-8 bg-gradient-to-r from-violet-500/80 to-blue-500/80"
              : "w-3 bg-white/20"
          )}
          aria-label={`Go to page ${index + 1}`}
        />
      ))}
    </div>
  );
}
