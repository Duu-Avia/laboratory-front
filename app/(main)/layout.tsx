import LeftSidebar from "../_components/LeftSideBar";
import FloatingHelp from "../_components/FloatingHelp";
import { UserProvider } from "@/lib/hooks/useUser";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="flex h-full">
        <LeftSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
          <FloatingHelp />
        </div>
      </div>
    </UserProvider>
  );
}
