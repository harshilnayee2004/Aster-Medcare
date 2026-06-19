import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ patientId, children }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-ink">
      <Sidebar patientId={patientId} />
      <Topbar />
      <main className="ml-64 pt-24">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
