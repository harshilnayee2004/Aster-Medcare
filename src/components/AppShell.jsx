import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ patientId, children }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans">
      <Sidebar patientId={patientId} />
      <Topbar />
      <main className="ml-64 pt-24 min-h-screen flex flex-col">
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
