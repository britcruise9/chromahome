// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://shopbycolor.com'),
  title: {
    default: "SHOP BY COLOR - Find Perfect Home Decor in Your Color",
    template: "%s | SHOP BY COLOR"
  },
  description: "Find matching furniture & decor in your exact color. Upload a paint chip or choose a color to discover perfectly coordinated pieces.",
  keywords: "shop by color, color match furniture, room color matching, color coordinated decor, paint color matching furniture",
  openGraph: {
    title: "SHOP BY COLOR - Find Perfect Home Decor in Your Color",
    description: "Find matching furniture & decor in your exact color",
    url: 'https://shopbycolor.com',
    siteName: 'SHOP BY COLOR',
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
        <link rel="canonical" href="https://shopbycolor.com" />
      </head>
      <body className={inter.className}>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
