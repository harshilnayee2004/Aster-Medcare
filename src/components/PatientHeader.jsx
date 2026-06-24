export default function PatientHeader({ patient }) {
  return (
    <section className="rounded-xl border border-line bg-white p-6 shadow-soft transition hover:shadow-md">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#f0f5ff] text-2xl font-bold text-brand shadow-inner border border-blue-100">
            {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Patient ID:</span>
              <span className="rounded bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-brand border border-blue-100">{patient.patientId}</span>
            </div>
          </div>
        </div>        
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-6">
        <InfoCard 
          label="Age" 
          value={`${patient.age} Yrs`} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          } 
        />
        <InfoCard 
          label="Gender" 
          value={patient.gender} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          } 
        />
        <InfoCard 
          label="Mobile" 
          value={patient.mobile} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          } 
        />
        <InfoCard 
          label="Company" 
          value={patient.company} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          } 
        />
        <InfoCard 
          label="Father's Name" 
          value={patient.fatherName} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } 
        />
        <InfoCard 
          label="Occupation" 
          value={patient.occupation} 
          icon={
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
            </svg>
          } 
        />
      </div>
    </section>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-slate-50/50 p-3 transition hover:bg-slate-50">
      <span className="flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm font-medium text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );
}
