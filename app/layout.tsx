import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BASE_PATH, DEFAULT_ICON } from "@lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Launchpad Gallery",
  description:
    "Curate and launch your favorite web tools with a customizable glassmorphism UI.",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  themeColor: "#0f172a",
  icons: {
    icon: DEFAULT_ICON,
    apple: DEFAULT_ICON,
  },
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
