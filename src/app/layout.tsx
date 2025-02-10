// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://shopbycolor.com'),
  title: {
    default: "SHOP BY COLOR - Find Perfect Home Decor in Your Color",
    template: "%s | SHOP BY COLOR"
  },
  description: "Upload any paint color and instantly find matching furniture & decor. Find the perfect pieces in your exact color for any room.",
  keywords: "shop by color, color match furniture, room color matching, color coordinated decor, paint color matching furniture",
  openGraph: {
    title: "SHOP BY COLOR - Find Perfect Home Decor in Your Color",
    description: "Upload any paint color to find perfectly matching furniture & decor",
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
      </body>
    </html>
  );
}
