import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../services/api";
import HealthRegisterTemplate from "./HealthRegisterTemplate.jsx";
import EyeExamTemplate from "./EyeExamTemplate.jsx";
import Form33Template from "./Form33Template.jsx";
import PostMedicalTemplate from "./PostMedicalTemplate.jsx";
import XRayReportTemplate from "./XRayReportTemplate.jsx";

export default function FullReportTemplate() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get(`/patients/${patientId}`);
        setPatient(response.data);
      } catch (err) {
        console.error("Failed to load patient record:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Compiling Full Medical Dossier...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  const forms = patient.forms || {};
  const completedCount = [
    forms.healthRegister?.savedAt,
    forms.eyeExam?.savedAt,
    forms.form33?.savedAt,
    forms.postMedical?.savedAt,
    forms.xrayReport?.savedAt,
  ].filter(Boolean).length;

  function copyShareLink() {
    try {
      // Base64 encode the patient data for a clean shareable link
      const dataStr = JSON.stringify(patient);
      const base64 = btoa(unescape(encodeURIComponent(dataStr)));
      const shareUrl = `${window.location.origin}?sharedData=${base64}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Failed to generate share link:", e);
      alert("Could not generate shareable link.");
    }
  }

  function handlePrint() {
    const originalTitle = document.title;
    if (patient) {
      const sanitizedName = patient.name.replace(/[^a-zA-Z0-9]/g, "_");
      document.title = `${sanitizedName}_${patient.patientId}_Combined_Medical_Report`;
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  }

  return (
    <main className="template-screen">
      <div className="template-actions flex items-center justify-between !w-[800px] mx-auto mb-6 bg-white p-4 rounded-xl border border-line shadow-soft print:hidden">
        <div className="flex items-center gap-3">
          <Link to={`/patients/${patientId}`} className="button-secondary !h-10 px-4 flex items-center justify-center">
            &larr; Back to Dashboard
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {completedCount} of 5 Reports Compiled
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={copyShareLink} 
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#25D366] bg-[#25D366] px-4 text-xs font-semibold text-white transition hover:bg-[#20ba5a] active:scale-95 shadow-sm"
          >
            {copied ? "Link Copied! ✓" : "Copy Share Link"}
          </button>
          <button onClick={handlePrint} className="button-primary !h-10 px-4 flex items-center justify-center">
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="space-y-12 print:space-y-0">
        {completedCount === 0 ? (
          <div className="max-w-[800px] mx-auto bg-white p-12 rounded-xl border border-line text-center text-slate-400 italic shadow-soft print:hidden">
            No medical forms have been completed yet. Go to the dashboard to fill in details.
          </div>
        ) : (
          <>
            {forms.healthRegister?.savedAt && (
              <div className="page-break">
                <HealthRegisterTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms.eyeExam?.savedAt && (
              <div className="page-break">
                <EyeExamTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms.form33?.savedAt && (
              <div className="page-break">
                <Form33Template hideActions={true} patient={patient} />
              </div>
            )}
            {forms.postMedical?.savedAt && (
              <div className="page-break">
                <PostMedicalTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms.xrayReport?.savedAt && (
              <div className="page-break">
                <XRayReportTemplate hideActions={true} patient={patient} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
