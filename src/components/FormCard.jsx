import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/localStorage.js";

export default function FormCard({ title, status, icon, to, disabled, savedAt }) {
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
      <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 opacity-60 cursor-not-allowed select-none">
        <div className="flex items-center justify-between">
          {renderIconBadge(icon)}
          <span className="text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
        </div>
        <div className="mt-4">
          <span className="text-base font-bold text-slate-400 tracking-tight">{title}</span>
          <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-1">Locked (Access Required)</p>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-3">
          <span className="text-xxs font-extrabold text-slate-400 block">- Locked</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {renderIconBadge(icon)}
          {completed ? (
            <span className="inline-flex items-center gap-1 text-xxs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xxs font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
              Pending
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight truncate">{title}</h3>
          {savedAt ? (
            <p className="text-xxs text-slate-400 mt-1 font-medium">Last Saved: {formatDateTime(savedAt)}</p>
          ) : (
            <p className="text-xxs text-slate-400 mt-1 italic font-medium">Not started yet</p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
        <Link
          to={to}
          className={`inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg border transition ${
            completed
              ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              : "bg-brand text-white border-brand hover:bg-blue-700"
          }`}
        >
          {completed ? "Edit Form" : "Fill Form"}
        </Link>
        <span className="text-slate-300 group-hover:text-brand group-hover:translate-x-0.5 transition duration-200">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
