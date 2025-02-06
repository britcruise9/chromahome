// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://chromahome.app'),
  title: {
    default: "ChromaHome - Match Paint Colors to Perfect Decor",
    template: "%s | ChromaHome"
  },
  description: "Upload any paint chip and instantly find furniture & decor in your perfect color. Stop guessing if decor matches your wall color.",
  keywords: "paint color matcher, home decor color matching, accent pillow color finder, wall color matching",
  openGraph: {
    title: "ChromaHome - Turn Paint Colors Into Perfect Decor",
    description: "Upload paint colors to find perfectly matching furniture & decor",
    url: 'https://chromahome.app',
    siteName: 'ChromaHome',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://chromahome.app" />
      </head>
      <body className={inter.className}>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js" />
        {children}
      </body>
    </html>
  );
}
