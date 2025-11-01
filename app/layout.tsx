import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BASE_PATH, DEFAULT_ICON } from "@lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  applicationName: "Launchpad Gallery",
  title: "Launchpad Gallery",
  description:
    "Curate and launch your favorite web tools with a customizable glassmorphism UI.",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  icons: {
    icon: DEFAULT_ICON,
    apple: DEFAULT_ICON,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Script id="sanitize-extension-attributes" strategy="beforeInteractive">
          {`(function(){var ATTR_PREFIXES=['bis_','__processed_'];var ATTR_NAMES=new Set(['bis_skin_checked','bis_register']);var shouldStrip=function(name){if(ATTR_NAMES.has(name)) return true;for(var i=0;i<ATTR_PREFIXES.length;i++){if(name.startsWith(ATTR_PREFIXES[i])) return true;}return false;};var cleanElement=function(el){Array.prototype.slice.call(el.attributes||[],0).forEach(function(attr){if(shouldStrip(attr.name)){el.removeAttribute(attr.name);}});};var cleanTree=function(root){if(!root) return;cleanElement(root);var walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,null,false);var current;while((current=walker.nextNode())){cleanElement(current);}};var cleanDocument=function(){cleanTree(document.documentElement);};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){cleanDocument();},{once:true});}else{cleanDocument();}var observer=new MutationObserver(function(mutations){mutations.forEach(function(mutation){if(mutation.type==='attributes'&&shouldStrip(mutation.attributeName)){mutation.target.removeAttribute(mutation.attributeName);}if(mutation.type==='childList'){mutation.addedNodes.forEach(function(node){if(node.nodeType===1){cleanTree(node);}});}});});observer.observe(document.documentElement,{subtree:true,attributes:true,childList:true});})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
