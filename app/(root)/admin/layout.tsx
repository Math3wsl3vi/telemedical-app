import Sidebar from "@/components/admin/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex file:font-poppins">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}