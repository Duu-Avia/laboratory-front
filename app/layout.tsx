import "./globals.css";

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
