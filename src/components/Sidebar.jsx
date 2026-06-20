import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const baseNavItems = [
  { 
    label: "Patients List", 
    path: "/patients",
    roles: ["admin", "doctor", "employee"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    label: "Bulk Import", 
    path: "/import",
    roles: ["admin", "employee"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    )
  },
  { 
    label: "Analytics", 
    path: "/analytics",
    roles: ["admin", "doctor"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    label: "Admin Panel", 
    path: "/admin",
    roles: ["admin"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    )
  }
];

export default function Sidebar({ patientId }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const userRole = currentUser?.role || "employee";

  const navItems = [
    patientId && {
      label: "Patient Dashboard",
      path: `/patients/${patientId}`,
      roles: ["admin", "doctor", "employee"],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    ...baseNavItems
  ].filter(Boolean);

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-line bg-white px-6 py-8">
      <Link to="/patients" className="mb-16 flex items-center gap-3 text-lg font-bold text-ink">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-brand text-brand shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </span>
        Aster Medcare
      </Link>

      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.label === "Patient Dashboard" && location.pathname.startsWith(`/patients/${patientId}`));
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                isActive ? "bg-[#f1f6ff] text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-brand" : "text-slate-400"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={logout} 
        className="mt-auto flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition text-left w-full"
      >
        <span className="flex-shrink-0 text-slate-400">
          <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </span>
        Logout
      </button>
    </aside>
  );
}
