import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";

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
  const patient = getPatient(patientId);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...defaults,
    treatmentRecommendation: "No Any Medication Requirement...!!!",
    fitStatus: "FIT",
    employmentTill: "",
    certificateDate: "",
    ...(patient?.postMedical || {}),
  });

  if (!patient) return <Navigate to="/patients" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    save();
    navigate(`/patients/${patientId}`);
  }

  function save() {
    updatePatientForm(patientId, "postMedical", form);
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
          <div className="flex gap-3">
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
                <div>
                  <label className="field-label font-semibold text-slate-700">Certificate Signature Date & Time</label>
                  <input 
                    className="input" 
                    type="datetime-local" 
                    value={form.certificateDate} 
                    onChange={(event) => updateField("certificateDate", event.target.value)} 
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </AppShell>
  );
}

export { tests as postMedicalTests };
