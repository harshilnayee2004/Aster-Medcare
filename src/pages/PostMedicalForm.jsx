import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post Medical Evaluation Form</h1>
            <p className="mt-1 text-sm text-slate-500">Log reviews and observations across medical test sections for {patient.name}.</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              saveStatus === "Saved ✓" ? "bg-green-50 text-green-700 border border-green-200" :
              saveStatus === "Saving..." ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" :
              "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {saveStatus}
            </span>
            <button type="button" onClick={preview} className="button-secondary">Preview Report</button>
            <button type="submit" className="button-primary">Save Form</button>
          </div>
        </div>

        <div className="space-y-8">
          <section className="border border-line rounded-xl bg-slate-50/20 p-6">
            <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">1. Doctor Observations Checklist (Normal/Abnormal)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map(([key, label]) => (
                <div key={key} className="rounded-xl border border-line bg-white p-4.5 shadow-sm hover:shadow-md transition">
                  <label className="field-label font-semibold text-slate-700 mb-2.5">{label}</label>
                  <select 
                    className="input" 
                    value={form[key]} 
                    onChange={(event) => updateField(key, event.target.value)}
                  >
                    <option value="YES">Normal (YES)</option>
                    <option value="NO">Abnormal (NO)</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-line rounded-xl bg-slate-50/20 p-6">
            <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">2. Treatment & Fitness Certification</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="field-label font-semibold text-slate-700">Treatment Recommendation / Additional Advise</label>
                <textarea 
                  className="input min-h-[188px]" 
                  value={form.treatmentRecommendation} 
                  onChange={(event) => updateField("treatmentRecommendation", event.target.value)} 
                  placeholder="Enter medical treatment recommendations or custom notes..."
                />
              </div>
              <div className="space-y-5">
                <div>
                  <label className="field-label font-semibold text-slate-700">Fit Status</label>
                  <select 
                    className="input" 
                    value={form.fitStatus} 
                    onChange={(event) => updateField("fitStatus", event.target.value)}
                  >
                    <option value="FIT">FIT</option>
                    <option value="UNFIT">UNFIT</option>
                  </select>
                </div>
                <div>
                  <label className="field-label font-semibold text-slate-700">Employment Fit Till</label>
                  <input 
                    className="input" 
                    value={form.employmentTill} 
                    onChange={(event) => updateField("employmentTill", event.target.value)} 
                    placeholder="Upcoming annual / biannual date description" 
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
          </section>
        </div>
      </form>
    </AppShell>
  );
}

export { tests as postMedicalTests };
