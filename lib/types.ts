export type AppOrigin = "catalog" | "custom" | "system";

export type LaunchpadApp = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  icon: string;
  tags?: string[];
  origin: AppOrigin;
  type?: "hidden-group";
  hiddenCount?: number;
};

export type LaunchpadSettings = {
  backgroundType: "image" | "color";
  backgroundImage: string;
  backgroundColor: string;
  overlayOpacity: number;
  blurStrength: number;
  glassTintColor: string;
  glassTintOpacity: number;
  hasCompletedSetup: boolean;
};

export type LaunchpadUserData = {
  hiddenAppIds: string[];
  customApps: LaunchpadApp[];
  pageSize: number;
};

export type LaunchpadContextMenuState = {
  appId: string | null;
  source: "grid" | "hidden" | null;
  position: { x: number; y: number } | null;
};
