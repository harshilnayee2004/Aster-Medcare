import { Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatients } from "../utils/localStorage.js";

export default function PatientSelection() {
  const patients = getPatients();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Selection</h1>
          <p className="mt-1 text-sm text-slate-500">Register a new patient or continue managing diagnostics for an existing worker.</p>
          
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link 
              to="/patients/new" 
              className="group flex flex-col justify-center rounded-xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">New Patient Registration</span>
              <span className="mt-1 text-sm text-slate-400">Add details and generate a unique Patient ID</span>
            </Link>
            
            <a 
              href="#existing" 
              className="group flex flex-col justify-center rounded-xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">Existing Patient Search</span>
              <span className="mt-1 text-sm text-slate-400">Search and open profiles of saved patients</span>
            </a>
          </div>
        </section>

        <ExistingPatients patients={patients} />
      </div>
    </AppShell>
  );
}

function ExistingPatients({ patients }) {
  return (
    <section id="existing" className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft scroll-mt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Existing Patients</h2>
          <p className="mt-1 text-sm text-slate-500">Registered records saved in LocalStorage.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input 
            className="input pr-10" 
            placeholder="Search patient name, ID, or company..." 
            onChange={(event) => {
              const query = event.currentTarget.value.toLowerCase();
              document.querySelectorAll("[data-patient-row]").forEach((row) => {
                row.classList.toggle("hidden", !row.textContent.toLowerCase().includes(query));
              });
            }} 
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        {patients.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 italic">No patients registered in this browser yet.</div>
        ) : (
          <div className="min-w-full divide-y divide-line">
            {/* Table Header */}
            <div className="bg-slate-50/70 hidden sm:grid sm:grid-cols-[1.3fr_1fr_1.2fr_auto] items-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Patient Name</span>
              <span>Patient ID</span>
              <span>Company / Factory</span>
              <span className="text-right pr-4">Action</span>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-line bg-white">
              {patients.map((patient) => (
                <Link
                  data-patient-row
                  key={patient.patientId}
                  to={`/patients/${patient.patientId}`}
                  className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_1.2fr_auto] items-center px-6 py-4.5 text-sm transition hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-0.5 sm:block">
                    <span className="font-semibold text-slate-800">{patient.name}</span>
                    <span className="text-xs text-slate-400 sm:hidden mt-0.5">{patient.patientId}</span>
                  </div>
                  <span className="hidden sm:inline font-mono font-medium text-brand">{patient.patientId}</span>
                  <span className="text-slate-500 mt-1 sm:mt-0 text-xs sm:text-sm">{patient.company || "Aster Medcare"}</span>
                  <span className="mt-3 sm:mt-0 text-xs sm:text-sm font-semibold text-brand text-right pr-4 sm:group-hover:translate-x-0.5 transition flex items-center justify-end gap-1">
                    Open Dashboard 
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
