import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: { icon: [] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className="h-screen overflow-hidden">{children}</body>
    </html>
  );
}
