import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f9fc] px-6 text-center text-ink font-sans">
      <div className="max-w-md space-y-6 bg-white p-10 rounded-2xl border border-line shadow-soft animate-fade-in">
        {/* Big visual number */}
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-50 border border-blue-100 text-brand text-4xl font-extrabold shadow-inner">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Page Not Found</h1>
          <p className="text-sm text-slate-400">
            The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <Link
          to="/patients"
          className="button-primary inline-flex items-center justify-center gap-2 w-full !h-11 shadow-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Return to Patients List</span>
        </Link>
      </div>
    </main>
  );
}
