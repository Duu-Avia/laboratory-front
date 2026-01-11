import "./globals.css";
import LeftSidebar from "./_components/LeftSideBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">
          <LeftSidebar />
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}
