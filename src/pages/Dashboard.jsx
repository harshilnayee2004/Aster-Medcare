import { Link, Navigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import FormCard from "../components/FormCard.jsx";
import PatientHeader from "../components/PatientHeader.jsx";
import { formatDateTime, getPatient } from "../utils/localStorage.js";

export default function Dashboard() {
  const { patientId } = useParams();
  const patient = getPatient(patientId);

  if (!patient) return <Navigate to="/patients" replace />;

  const activities = [
    patient.form33 && ["Form No. 33 completed", patient.form33.savedAt],
    patient.postMedical && ["Post Medical evaluation completed", patient.postMedical.savedAt],
    patient.eyeExam && ["Eye examination completed", patient.eyeExam.savedAt],
    patient.healthRegister && ["Health Register completed", patient.healthRegister.savedAt],
    patient.xrayReport && ["X-Ray Report completed", patient.xrayReport.savedAt],
    ["Patient registered", patient.createdAt],
  ].filter(Boolean);

  return (
    <AppShell patientId={patientId}>
      <div className="space-y-5">
        <PatientHeader patient={patient} />

        {/* Full Report Actions Banner */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Compiled Medical Dossier</h2>
            <p className="mt-1 text-sm text-slate-300">Generate a unified PDF containing all completed medical forms, ready for download and sharing.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Progress:</span>
              <span className="text-white">
                {[
                  patient.healthRegister,
                  patient.eyeExam,
                  patient.form33,
                  patient.postMedical,
                  patient.xrayReport
                ].filter(Boolean).length} of 5 forms completed
              </span>
            </div>
          </div>
          <Link
            to={`/patients/${patientId}/full-report/preview`}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-98 shadow-sm whitespace-nowrap"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Generate Full Report
          </Link>
        </section>

        <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Medical Forms</h2>
            <p className="mt-1 text-sm text-muted">Select any medical evaluation form below to enter patient diagnostics.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <FormCard
              title="Post Medical Evaluation"
              icon="PM"
              status={patient.postMedical ? "Completed" : "Pending"}
              to={`/patients/${patientId}/post-medical`}
            />
            <FormCard
              title="Eye Examination"
              icon="EX"
              status={patient.eyeExam ? "Completed" : "Pending"}
              to={`/patients/${patientId}/eye-exam`}
            />
            <FormCard
              title="Form No. 33"
              icon="33"
              status={patient.form33 ? "Completed" : "Pending"}
              to={`/patients/${patientId}/form-33`}
            />
            <FormCard
              title="Form No. 32"
              icon="32"
              status={patient.healthRegister ? "Completed" : "Pending"}
              to={`/patients/${patientId}/health-register`}
            />
            <FormCard
              title="X-Ray Report"
              icon="XR"
              status={patient.xrayReport ? "Completed" : "Pending"}
              to={`/patients/${patientId}/xray-report`}
            />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Recent Activity</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">History</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map(([label, date]) => (
              <div key={`${label}-${date}`} className="rounded-lg border border-line bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1.5 text-xs text-muted">{formatDateTime(date)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
