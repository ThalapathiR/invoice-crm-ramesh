import { AdminSidebar } from "./AdminSidebar";
import { TopBar } from "./TopBar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar isAdmin={true} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#FFFDF8] dark:bg-black/20">
          {children}
        </main>
      </div>
    </div>
  );
}
