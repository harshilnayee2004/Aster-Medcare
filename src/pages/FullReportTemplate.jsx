import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../services/api";
import PreMedicalTemplate from "./PreMedicalTemplate.jsx";
import HealthRegisterTemplate from "./HealthRegisterTemplate.jsx";
import EyeExamTemplate from "./EyeExamTemplate.jsx";
import Form33Template from "./Form33Template.jsx";
import PostMedicalTemplate from "./PostMedicalTemplate.jsx";
import XRayReportTemplate from "./XRayReportTemplate.jsx";
import AirportBohwTemplate from "./AirportBohwTemplate.jsx";
import HeightPassTemplate from "./HeightPassTemplate.jsx";
import OphthalForm6Template from "./OphthalForm6Template.jsx";
import AudiometryFrontTemplate from "./AudiometryFrontTemplate.jsx";
import AudiometryBackTemplate from "./AudiometryBackTemplate.jsx";
import VaccineCertificateTemplate from "./VaccineCertificateTemplate.jsx";
import FitnessCertificateTemplate from "./FitnessCertificateTemplate.jsx";
import DeathCertificateTemplate from "./DeathCertificateTemplate.jsx";
import AirportBohwHtFrontTemplate from "./AirportBohwHtFrontTemplate.jsx";
import AirportBohwHtBackTemplate from "./AirportBohwHtBackTemplate.jsx";
import FoodHandlerTemplate from "./FoodHandlerTemplate.jsx";
import VaccinationFrontTemplate from "./VaccinationFrontTemplate.jsx";
import VaccinationBackTemplate from "./VaccinationBackTemplate.jsx";
import PftFrontTemplate from "./PftFrontTemplate.jsx";

export default function FullReportTemplate() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [printingReady, setPrintingReady] = useState(false);

  useEffect(() => {
    if (loading || !patient) return;
    const checkInterval = setInterval(() => {
      const text = document.body.innerText || "";
      const isStillLoading = text.includes("Rendering page") || 
                             text.includes("Stamping data") || 
                             text.includes("Loading");
      setPrintingReady(!isStillLoading);
    }, 400);
    return () => clearInterval(checkInterval);
  }, [loading, patient]);

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
    forms.preMedical?.savedAt,
    forms.healthRegister?.savedAt,
    forms.eyeExam?.savedAt,
    forms.form33?.savedAt,
    forms.postMedical?.savedAt,
    forms.xrayReport?.savedAt,
    forms["4-form-airport-bohw"]?.savedAt,
    forms["5-form-height-pass"]?.savedAt,
    forms["10-form-ophthal-form-6"]?.savedAt,
    forms["11-form-audiometry-front"]?.savedAt,
    forms["12-form-audiometry-back"]?.savedAt,
    forms["15-form-vaccination-front"]?.savedAt,
    forms["17-form-food-handler-certificate"]?.savedAt,
    forms["18-form-vaccine-ircs-forms-2"]?.savedAt,
    forms["25-form-for-medical-fitness-certificate-format"]?.savedAt,
    forms["26-form-death-certificate"]?.savedAt,
    forms["35-form-airport-bohw-ht-front"]?.savedAt,
    forms["36-form-airport-bohw-ht-back"]?.savedAt,
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
            {completedCount} of 17 Reports Compiled
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
          <button 
            disabled={!printingReady} 
            onClick={handlePrint} 
            className={`button-primary !h-10 px-4 flex items-center justify-center gap-1.5 transition ${!printingReady ? "opacity-55 cursor-not-allowed bg-slate-400 hover:bg-slate-400" : ""}`}
          >
            {!printingReady && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {printingReady ? "Print / Save PDF" : "Preparing Report..."}
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
            {forms.preMedical?.savedAt && (
              <div className="page-break">
                <PreMedicalTemplate hideActions={true} patient={patient} />
              </div>
            )}
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
            {forms["4-form-airport-bohw"]?.savedAt && (
              <div className="page-break">
                <AirportBohwTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["5-form-height-pass"]?.savedAt && (
              <div className="page-break">
                <HeightPassTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["10-form-ophthal-form-6"]?.savedAt && (
              <div className="page-break">
                <OphthalForm6Template hideActions={true} patient={patient} />
              </div>
            )}
            {forms["11-form-audiometry-front"]?.savedAt && (
              <div className="page-break">
                <AudiometryFrontTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["12-form-audiometry-back"]?.savedAt && (
              <div className="page-break">
                <AudiometryBackTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["15-form-vaccination-front"]?.savedAt && (
              <div className="page-break">
                <VaccinationFrontTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["16-form-vaccination-back"]?.savedAt && (
              <div className="page-break">
                <VaccinationBackTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["13-form-pft-front"]?.savedAt && (
              <div className="page-break">
                <PftFrontTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["17-form-food-handler-certificate"]?.savedAt && (
              <div className="page-break">
                <FoodHandlerTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["18-form-vaccine-ircs-forms-2"]?.savedAt && (
              <div className="page-break">
                <VaccineCertificateTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["25-form-for-medical-fitness-certificate-format"]?.savedAt && (
              <div className="page-break">
                <FitnessCertificateTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["26-form-death-certificate"]?.savedAt && (
              <div className="page-break">
                <DeathCertificateTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["35-form-airport-bohw-ht-front"]?.savedAt && (
              <div className="page-break">
                <AirportBohwHtFrontTemplate hideActions={true} patient={patient} />
              </div>
            )}
            {forms["36-form-airport-bohw-ht-back"]?.savedAt && (
              <div className="page-break">
                <AirportBohwHtBackTemplate hideActions={true} patient={patient} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
