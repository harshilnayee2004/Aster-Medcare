export default function PatientHeader({ patient }) {
  const cleanMobile = patient.mobile ? patient.mobile.replace(/\D/g, "") : "";
  const whatsappMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
  const whatsappUrl = `https://wa.me/${whatsappMobile}?text=${encodeURIComponent(
    `Hello ${patient.name},\n\nWelcome to Estel Medicare!\nYour Patient ID is: ${patient.patientId}\n\nThank you for choosing Estel Medicare.`
  )}`;

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

        {/* Action Button Section */}
        {patient.mobile && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-5 text-sm font-semibold text-white transition hover:bg-[#1ebe57] active:scale-98 shadow-sm hover:shadow whitespace-nowrap self-start md:self-auto"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437 0 9.862-4.43 9.866-9.872.002-2.637-1.023-5.115-2.885-6.981-1.862-1.865-4.343-2.893-6.983-2.895-5.439 0-9.865 4.432-9.869 9.874-.001 1.562.415 3.09 1.202 4.448l-.992 3.622 3.702-.971zm11.367-7.25c-.27-.135-1.597-.788-1.846-.878-.249-.09-.43-.135-.61.135-.18.27-.697.878-.853 1.058-.156.18-.312.202-.582.067-.27-.135-1.14-.42-2.172-1.34-.803-.715-1.345-1.6-1.503-1.871-.158-.271-.017-.417.118-.552.122-.121.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.338-.022-.473-.068-.135-.61-1.468-.836-2.012-.22-.53-.443-.459-.61-.468-.157-.008-.339-.01-.521-.01s-.48.067-.73.338c-.25.27-.954.933-.954 2.277s.977 2.64 1.112 2.822c.136.182 1.923 2.936 4.658 4.116.65.28 1.157.447 1.554.573.654.208 1.248.179 1.718.109.524-.078 1.598-.652 1.824-1.282.226-.63.226-1.17.158-1.283-.068-.112-.249-.202-.519-.337z" />
            </svg>
            Send WhatsApp Greeting
          </a>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
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
