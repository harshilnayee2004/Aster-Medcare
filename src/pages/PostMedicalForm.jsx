import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import DateField from "../components/DateField.jsx";

const tests = [
  ["generalExamination", "General Examination"],
  ["systemicExamination", "Systemic Examination"],
  ["pathologicalEvaluation", "Pathological Test Evaluation"],
  ["ophthalmicEvaluation", "Ophthalmic Evaluation"],
  ["serologicalEvaluation", "Serological Evaluation"],
  ["audiometryEvaluation", "Audiometry / ENT Evaluation"],
  ["dermatologicalEvaluation", "Dermatological Evaluation"],
  ["dentalEvaluation", "Dental Evaluation"],
  ["gynecologicalEvaluation", "Gynecological Evaluation"],
  ["radiologicalEvaluation", "Radiological Evaluation"],
  ["pulmonaryEvaluation", "Pulmonary Evaluation"],
  ["psychologicalEvaluation", "Psychological Evaluation"],
];

const defaults = Object.fromEntries(tests.map(([key]) => [key, "YES"]));

export default function PostMedicalForm() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved ✓");

  useEffect(() => {
    async function loadData() {
      try {
        const patientData = await getPatient(patientId);
        setPatient(patientData);
        
        // Load existing form from DB
        try {
          const res = await api.get(`/patients/${patientId}/forms/postMedical`);
          if (res.data && res.data.formExists) {
            setForm({
              ...defaults,
              ...res.data.form.data
            });
          } else {
            setForm({
              ...defaults,
              treatmentRecommendation: "No Any Medication Requirement...!!!",
              fitStatus: "FIT",
              employmentTill: "",
              certificateDate: "",
            });
          }
        } catch {
          // If no form in DB, use default
          setForm({
            ...defaults,
            treatmentRecommendation: "No Any Medication Requirement...!!!",
            fitStatus: "FIT",
            employmentTill: "",
            certificateDate: "",
          });
        }
      } catch (err) {
        console.error("Failed to load patient:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!form || loading) return;

    setSaveStatus("Saving...");
    const timer = setTimeout(async () => {
      try {
        await updatePatientForm(patientId, "postMedical", form);
        setSaveStatus("Saved ✓");
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("Error ✗");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form]);

  if (loading) {
    return (
      <AppShell patientId={patientId}>
        <div className="text-center py-20 text-slate-500 font-medium">Loading form details...</div>
      </AppShell>
    );
  }

  if (!patient || !form) {
    return <Navigate to="/patients" replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setSaveStatus("Saving...");
    try {
      await updatePatientForm(patientId, "postMedical", form);
      setSaveStatus("Saved ✓");
    } catch {
      setSaveStatus("Error ✗");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await save();
    navigate(`/patients/${patientId}`);
  }

  function preview() {
    save();
    navigate(`/patients/${patientId}/post-medical/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb link */}
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Post Medical Evaluation</span>
              <span className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {patient.name} <span className="font-mono text-xs font-semibold text-brand bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">{patient.patientId}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className={`text-xxs font-bold px-2.5 py-1 rounded-full ${
              saveStatus === "Saved ✓" ? "bg-green-50 text-green-700 border border-green-200/50" :
              saveStatus === "Saving..." ? "bg-amber-50 text-amber-700 border border-amber-200/50 animate-pulse" :
              "bg-red-50 text-red-700 border border-red-200/50"
            }`}>
              {saveStatus}
            </span>
            <button type="button" onClick={preview} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">Preview Report</button>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">Save Form</button>
          </div>
        </div>

        {/* Form Body Cards */}
        <div className="space-y-6">
          {/* Card 1: Checklist */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">1. Doctor Observations Checklist (Normal/Abnormal)</h2>
              <p className="text-xxs text-slate-400 mt-0.5">Toggle observation values for applicable test categories.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map(([key, label]) => (
                <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50/80">
                  <label className="field-label font-bold text-slate-600 mb-2">{label}</label>
                  <select 
                    className="input !py-2 text-xs font-semibold text-slate-700" 
                    value={form[key]} 
                    onChange={(event) => updateField(key, event.target.value)}
                  >
                    <option value="YES">Normal (YES)</option>
                    <option value="NO">Abnormal (NO)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Details & Fit */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">2. Treatment & Fitness Certification</h2>
              <p className="text-xxs text-slate-400 mt-0.5">Final recommendations, fit status, and signing date.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="field-label font-bold text-slate-600 mb-2">Treatment Recommendation / Additional Advise</label>
                <textarea 
                  className="input min-h-[188px] text-xs font-medium text-slate-700" 
                  value={form.treatmentRecommendation} 
                  onChange={(event) => updateField("treatmentRecommendation", event.target.value)} 
                  placeholder="Enter medical treatment recommendations or custom notes..."
                />
              </div>
              <div className="space-y-5">
                <div>
                  <label className="field-label font-bold text-slate-600 mb-2">Fit Status <span className="text-red-500">*</span></label>
                  <select 
                    className="input !py-2.5 text-xs font-bold text-slate-700" 
                    value={form.fitStatus} 
                    onChange={(event) => updateField("fitStatus", event.target.value)}
                  >
                    <option value="FIT">FIT</option>
                    <option value="UNFIT">UNFIT</option>
                  </select>
                </div>
                <div>
                  <label className="field-label font-bold text-slate-600 mb-2">Employment Fit Till</label>
                  <input 
                    className="input text-xs font-medium text-slate-700" 
                    value={form.employmentTill} 
                    onChange={(event) => updateField("employmentTill", event.target.value)} 
                    placeholder="e.g. Next Annual Health Checkup" 
                  />
                </div>
                <DateField 
                  label="Certificate Signature Date & Time"
                  type="datetime-local" 
                  value={form.certificateDate} 
                  onChange={(val) => updateField("certificateDate", val)} 
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

export { tests as postMedicalTests };
