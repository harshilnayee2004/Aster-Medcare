import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import FormCard from "../components/FormCard.jsx";
import PatientHeader from "../components/PatientHeader.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { formatDateTime, getPatient } from "../utils/localStorage.js";
import api from "../services/api";

export default function Dashboard() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error("Failed to load patient:", err);
        setError("Patient record not found.");
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [patientId]);

  if (loading) {
    return (
      <AppShell patientId={patientId}>
        <div className="text-center py-20 text-slate-500 font-medium">Loading patient details...</div>
      </AppShell>
    );
  }

  if (error || !patient) {
    return <Navigate to="/patients" replace />;
  }

  const forms = patient.forms || {};
  const activities = [
    forms.form33?.savedAt && ["Form No. 33 completed", forms.form33.savedAt],
    forms.postMedical?.savedAt && ["Post Medical evaluation completed", forms.postMedical.savedAt],
    forms.eyeExam?.savedAt && ["Eye examination completed", forms.eyeExam.savedAt],
    forms.healthRegister?.savedAt && ["Health Register completed", forms.healthRegister.savedAt],
    forms.xrayReport?.savedAt && ["X-Ray Report completed", forms.xrayReport.savedAt],
    ["Patient registered", patient.createdAt],
  ].filter((item) => item && item[1]);

  const completedCount = [
    forms.healthRegister?.savedAt,
    forms.eyeExam?.savedAt,
    forms.form33?.savedAt,
    forms.postMedical?.savedAt,
    forms.xrayReport?.savedAt
  ].filter(Boolean).length;

  return (
    <AppShell patientId={patientId}>
      <div className="space-y-6">
        <PatientHeader patient={patient} />

        {/* Full Report Actions Banner */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Compiled Medical Dossier</h2>
            <p className="mt-1 text-sm text-slate-300">Generate a unified PDF containing all completed medical forms, ready for download and sharing.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Progress:</span>
              <span className="text-white">
                {completedCount} of 5 forms completed
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

        {/* Medical Forms Section */}
        <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Medical Forms</h2>
            <p className="mt-1 text-sm text-muted">Select any medical evaluation form below to enter patient diagnostics.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <FormCard
              title="Post Medical Evaluation"
              icon="PM"
              status={forms.postMedical?.savedAt ? "Completed" : "Pending"}
              to={`/patients/${patientId}/post-medical`}
            />
            <FormCard
              title="Eye Examination"
              icon="EX"
              status={forms.eyeExam?.savedAt ? "Completed" : "Pending"}
              to={`/patients/${patientId}/eye-exam`}
            />
            <FormCard
              title="Form No. 33"
              icon="33"
              status={forms.form33?.savedAt ? "Completed" : "Pending"}
              to={`/patients/${patientId}/form-33`}
            />
            <FormCard
              title="Form No. 32"
              icon="32"
              status={forms.healthRegister?.savedAt ? "Completed" : "Pending"}
              to={`/patients/${patientId}/health-register`}
            />
            <FormCard
              title="X-Ray Report"
              icon="XR"
              status={forms.xrayReport?.savedAt ? "Completed" : "Pending"}
              to={`/patients/${patientId}/xray-report`}
            />
          </div>
        </section>

        {/* File Attachments Section */}
        <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Patient Attachments</h2>
              <p className="mt-1 text-sm text-muted">Upload and manage diagnostic scans, laboratory reports, or general files.</p>
            </div>
            <FileUpload 
              patientId={patientId} 
              onUploadSuccess={async () => {
                // Reload patient record to fetch updated files list
                const data = await getPatient(patientId);
                setPatient(data);
              }} 
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Attached Documents ({patient.files?.length || 0})</h3>
            
            {!patient.files || patient.files.length === 0 ? (
              <div className="h-44 flex items-center justify-center border border-slate-100 rounded-xl bg-slate-50/50 text-sm text-slate-400 italic">
                No attachments uploaded for this patient yet.
              </div>
            ) : (
              <div className="divide-y divide-line border border-line rounded-xl overflow-hidden bg-white max-h-[320px] overflow-y-auto">
                {patient.files.map((file) => (
                  <div key={file._id} className="flex items-center justify-between p-4 text-sm transition hover:bg-slate-50/50">
                    <div className="space-y-1.5 max-w-[70%]">
                      <p className="font-semibold text-slate-800 truncate" title={file.fileName}>{file.fileName}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          file.category === "X-Ray" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          file.category === "ECG" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          file.category === "Lab Report" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {file.category}
                        </span>
                        <span>&bull;</span>
                        <span>{formatDateTime(file.uploadedAt)}</span>
                        {file.uploadedBy && (
                          <>
                            <span>&bull;</span>
                            <span>By: {file.uploadedBy.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-brand transition"
                        title="Download / View File"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to permanently delete this file?")) {
                            try {
                              await api.delete(`/patients/${patientId}/files/${file._id}`);
                              const data = await getPatient(patientId);
                              setPatient(data);
                            } catch (err) {
                              console.error("Failed to delete file:", err);
                              alert("Failed to delete file. Please try again.");
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Delete File"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity Section */}
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
