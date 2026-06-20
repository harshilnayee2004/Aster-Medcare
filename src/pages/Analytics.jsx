import { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [summaryRes, companiesRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/companies")
        ]);
        setSummary(summaryRes.data);
        setCompanies(companiesRes.data || []);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to fetch analytics statistics. Make sure the server is online.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const filteredCompanies = companies.filter(c =>
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">System Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Live operational stats, patient metrics, and factory breakdown profiles.</p>
          </div>
          {lastUpdated && (
            <div className="text-xxs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
              Last updated: {lastUpdated}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Aggregating system records...</div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Row 1: Volume Stat Cards */}
            <div>
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3.5 px-1">Registration Volume</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                  title="Patients Today" 
                  value={summary?.patientsToday} 
                  color="blue" 
                  subtitle="Registered today"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />
                <StatCard 
                  title="This Week" 
                  value={summary?.patientsThisWeek} 
                  color="blue" 
                  subtitle="Current Sunday-Saturday"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="This Month" 
                  value={summary?.patientsThisMonth} 
                  color="blue" 
                  subtitle="Current calendar month"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="This Year" 
                  value={summary?.patientsThisYear} 
                  color="blue" 
                  subtitle="Current calendar year"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Row 2: Status Stat Cards */}
            <div>
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3.5 px-1">Health Status Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                  title="Total FIT" 
                  value={summary?.fitCount} 
                  color="green" 
                  subtitle="Certified as fit for duty"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="Total UNFIT" 
                  value={summary?.unfitCount} 
                  color="red" 
                  subtitle="Certified as unfit for work"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="Completed Dossiers" 
                  value={summary?.completedReports} 
                  color="green" 
                  subtitle="Final reports signed"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <StatCard 
                  title="Pending Review" 
                  value={summary?.pendingReports} 
                  color="yellow" 
                  subtitle="Forms filled, status pending"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Company Breakdown Section */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Patient Volume By Company</h2>
                  <p className="mt-1 text-sm text-slate-500">Distribution of registered workers across partnering industrial organizations.</p>
                </div>
                
                {/* Search / Filter input */}
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="Filter by company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-2xl max-w-4xl bg-white shadow-xxs">
                {filteredCompanies.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 italic">No matching company records found.</div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
                    <thead className="bg-slate-50/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4 text-right">Workers Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCompanies.map((c, i) => (
                        <tr key={c.companyName || i} className="hover:bg-slate-50/30 transition odd:bg-slate-50/15">
                          <td className="px-6 py-4 font-semibold text-slate-800">{c.companyName}</td>
                          <td className="px-6 py-4 text-right text-brand font-mono font-bold">{c.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ title, value = 0, color = "blue", subtitle, icon }) {
  const colorMap = {
    blue: "border-l-brand text-brand",
    green: "border-l-emerald-500 text-emerald-500",
    red: "border-l-rose-500 text-rose-500",
    yellow: "border-l-amber-500 text-amber-500"
  };

  const badgeBg = {
    blue: "bg-blue-50 text-brand border-blue-100/50",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    red: "bg-rose-50 text-rose-700 border-rose-100/50",
    yellow: "bg-amber-50 text-amber-700 border-amber-100/50"
  };

  return (
    <div className={`rounded-2xl border border-slate-100 border-l-4 ${colorMap[color] || colorMap.blue} bg-white p-5 shadow-sm hover:shadow-md transition duration-200`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <span className={`${colorMap[color] || colorMap.blue}`}>
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          {value}
        </span>
        <span className={`px-2 py-0.5 rounded text-xxs font-extrabold uppercase border ${badgeBg[color] || badgeBg.blue}`}>
          {color === "blue" ? "Volume" : color === "green" ? "Fit" : color === "red" ? "Unfit" : "Pending"}
        </span>
      </div>
      <p className="mt-2 text-xxs font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}
