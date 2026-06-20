import { useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to fetch analytics statistics. Make sure the server is online.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Analytics & Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live operational stats, patient metrics, and factory breakdown profiles.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Aggregating system records...</div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Stat Cards Row 1: Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Patients Today" value={summary?.patientsToday} color="blue" subtitle="Registered today" />
              <StatCard title="This Week" value={summary?.patientsThisWeek} color="indigo" subtitle="Current Sunday-Saturday" />
              <StatCard title="This Month" value={summary?.patientsThisMonth} color="purple" subtitle="Current calendar month" />
              <StatCard title="This Year" value={summary?.patientsThisYear} color="slate" subtitle="Current calendar year" />
            </div>

            {/* Stat Cards Row 2: Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total FIT" value={summary?.fitCount} color="green" subtitle="Certified as fit for duty" />
              <StatCard title="Total UNFIT" value={summary?.unfitCount} color="red" subtitle="Certified as unfit for work" />
              <StatCard title="Completed Dossiers" value={summary?.completedReports} color="emerald" subtitle="Final reports signed" />
              <StatCard title="Pending Review" value={summary?.pendingReports} color="amber" subtitle="Forms filled, status pending" />
            </div>

            {/* Company Breakdown Section */}
            <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight font-sans">Patient Volume By Company</h2>
                <p className="mt-1 text-sm text-slate-500">Distribution of registered workers across partnering industrial organizations.</p>
              </div>

              <div className="overflow-hidden border border-line rounded-xl max-w-4xl bg-white">
                {companies.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400 italic">No company records found.</div>
                ) : (
                  <table className="min-w-full divide-y divide-line text-sm text-left">
                    <thead className="bg-slate-50/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4 text-right">Workers Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {companies.map((c, i) => (
                        <tr key={c.companyName || i} className="hover:bg-slate-50/30 transition">
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

function StatCard({ title, value = 0, color = "blue", subtitle }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-soft hover:shadow-md transition">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="mt-3.5 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          {value}
        </span>
        <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase border ${colorMap[color] || colorMap.blue}`}>
          Metrics
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}
