import { Link } from "react-router-dom";

export default function FormCard({ title, status, icon, to, disabled }) {
  const completed = status === "Completed";

  const renderIconBadge = (iconStr) => {
    switch (iconStr) {
      case "PM":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case "EX":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      case "33":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "32":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        );
      case "XR":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 11v2m0 6v.01M12 12v.01M16 12v.01M8 12v.01M8 8v.01M16 8v.01M16 16v.01M8 16v.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  if (disabled) {
    return (
      <div
        className="flex h-48 flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-6 opacity-60 cursor-not-allowed select-none"
      >
        <div className="mb-6 flex items-center justify-between">
          {renderIconBadge(icon)}
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-base font-bold text-slate-400 tracking-tight">{title}</span>
        <span className="mt-auto text-xxs font-bold uppercase tracking-wider text-slate-400/80">
          Locked
        </span>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group flex h-48 flex-col rounded-xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
    >
      <div className="mb-6">{renderIconBadge(icon)}</div>
      <span className="text-base font-bold text-slate-800 tracking-tight">{title}</span>
      <span className={`mt-auto flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${completed ? "text-emerald-600" : "text-amber-600"}`}>
        <span className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${completed ? "bg-emerald-500" : "bg-amber-500"}`}></span>
          {status}
        </span>
        <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand">→</span>
      </span>
    </Link>
  );
}
