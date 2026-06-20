import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/patients") return "Patient Records";
    if (path === "/patients/new") return "Register Patient";
    if (path === "/import") return "Bulk Excel Import";
    if (path === "/analytics") return "Analytics & Reporting";
    if (path === "/admin") return "Admin Control Panel";
    if (path.includes("/post-medical")) return "Post Medical Evaluation";
    if (path.includes("/eye-exam")) return "Eye Examination Form";
    if (path.includes("/form-33")) return "Form No. 33 (Fitness)";
    if (path.includes("/health-register")) return "Form No. 32 (Health Register)";
    if (path.includes("/xray-report")) return "X-Ray Report Entry";
    if (path.includes("/full-report")) return "Full Dossier Preview";
    if (path.startsWith("/patients/")) return "Patient Dashboard";
    return "Aster Medcare";
  };

  const getRoleBadgeColor = () => {
    const role = currentUser?.role;
    if (role === "admin") return "bg-red-50 text-red-700 border-red-200";
    if (role === "doctor") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-24 items-center justify-between border-b border-line bg-white px-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
        <p className="text-xxs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Aster Medcare System</p>
      </div>

      <div className="flex items-center gap-6 text-slate-700">
        {/* Static Notification Bell */}
        <button 
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition shadow-xxs"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-brand"></span>
        </button>

        {/* User Info & Dropdown Trigger */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3.5 hover:bg-slate-50/80 p-1.5 rounded-xl border border-transparent hover:border-slate-100 transition text-left"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 border border-slate-200 shadow-xxs">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
            </div>
            <div className="hidden md:flex flex-col leading-tight select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-800">{currentUser?.name}</span>
                <span className="text-xs text-slate-400">▼</span>
              </div>
              <span className={`self-start mt-1 px-2 py-0.5 rounded-full text-xxs font-bold uppercase border ${getRoleBadgeColor()}`}>
                {currentUser?.role}
              </span>
            </div>
          </button>

          {/* Premium Avatar Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-line bg-white py-2 shadow-lg animate-scale-up">
                <div className="border-b border-slate-100 px-4 py-2.5 mb-1.5">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.email}</p>
                </div>
                <div className="px-2">
                  <div className="rounded-lg px-3 py-2 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 flex items-center justify-between mb-1.5">
                    <span>Role Permissions:</span>
                    <span className="font-bold text-brand uppercase font-mono">{currentUser?.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
