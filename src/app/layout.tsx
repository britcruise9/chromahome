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
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
