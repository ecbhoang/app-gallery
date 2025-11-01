import type { RefObject } from "react";
import type { GlassTintStyle } from "@hooks/useLaunchpadView";
import PlusIcon from "@icons/PlusIcon";
import SearchIcon from "@icons/SearchIcon";
import SettingsIcon from "@icons/SettingsIcon";

type LaunchpadHeaderProps = {
  searchRef: RefObject<HTMLInputElement>;
  defaultValue: string;
  onSearchChange: (value: string) => void;
  onOpenAddApp: () => void;
  onOpenSettings: () => void;
  glassTint: GlassTintStyle;
};

export function LaunchpadHeader({
  searchRef,
  defaultValue,
  onSearchChange,
  onOpenAddApp,
  onOpenSettings,
  glassTint,
}: LaunchpadHeaderProps) {
  return (
    <header
      className="fixed max-w-[90%] sm:sticky top-6 z-10 mb-10 flex w-full sm:max-w-5xl items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-0 sm:p-4 text-white shadow-2xl/20 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.01]"
      style={glassTint}
    >
      <div className="flex flex-1 items-center gap-1">
        <SearchIcon className="h-5 w-5 text-slate-300" />
        <input
          ref={searchRef}
          id="search"
          type="search"
          placeholder="Search app..."
          autoComplete="off"
          className="w-full border-0 bg-transparent text-white placeholder:text-white text-base focus:border-transparent focus:outline-none focus:ring-0"
          defaultValue={defaultValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="hidden items-center gap-1 rounded-full bg-slate-700/50 px-3 py-1 text-xs font-medium text-slate-300 sm:flex">
        <span>⌘</span>
        <span>K</span>
      </div>
      <button
        type="button"
        onClick={onOpenAddApp}
        className="flex items-center justify-center gap-2 rounded-2xl sm:border sm:border-white/10 sm:bg-white/5 sm:px-3 sm:py-2 px-2 py-1 text-xs font-medium text-slate-200 sm:shadow-inner sm:shadow-white/5 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
      >
        <PlusIcon className="h-4 w-4" />
        <p className="hidden sm:block"> Add </p> 
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        className="flex items-center justify-center gap-2 rounded-2xl sm:border sm:border-white/10 sm:bg-white/5 sm:px-3 sm:py-2 px-2 py-1 text-xs font-medium text-slate-200 sm:shadow-inner sm:shadow-white/5 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
      >
        <SettingsIcon className="h-4 w-4" />
        <p className="hidden sm:block"> Settings </p> 
      </button>
    </header>
  );
}
