// File: src/app/layout.tsx
export const metadata = {
  title: "ChromaHome",
  description: "Turn Paint Colors Into Perfect Decor",
};

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global Layout Wrapper */}
        {children}
      </body>
    </html>
  );
}
