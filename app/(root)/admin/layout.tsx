import Sidebar from "@/components/admin/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex font-poppins">
      <Sidebar />
      <main className="flex-1 p-6 h-screen overflow-auto">{children}</main>
    </div>
  );
}