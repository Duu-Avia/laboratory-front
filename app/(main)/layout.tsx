import LeftSidebar from "../_components/LeftSideBar";
import TopHeader from "../_components/TopHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      
      <LeftSidebar />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
