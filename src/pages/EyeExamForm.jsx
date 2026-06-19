import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";

const initialEyeExam = {
  collectedBy: "",
  occupation: "",
  allergy: "NO",
  pastHistory: "NO",
  currentComplaint: "NO",
  distantRight: "6/6",
  distantLeft: "6/6",
  nearRight: "N/6",
  nearLeft: "N/6",
  colorVision: "Normal",
  powerRight: "No",
  powerLeft: "No",
  pupilRight: "Bilaterally Equal & Reactive to Light",
  pupilLeft: "Bilaterally Equal & Reactive to Light",
  retinaRight: "Normal",
  retinaLeft: "Normal",
  visualAcuityRight: "YES",
  visualAcuityLeft: "YES",
  nightVisionRight: "NO",
  nightVisionLeft: "NO",
  colorDefectRight: "NO",
  colorDefectLeft: "NO",
  diplopiaRight: "NO",
  diplopiaLeft: "NO",
  pathologyRight: "NO",
  pathologyLeft: "NO",
  remarks: "NA",
  conclusion: "Normal Eye Vision Fit For Job",
};

export default function EyeExamForm() {
  const { patientId } = useParams();
  const patient = getPatient(patientId);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...initialEyeExam,
    name: patient?.name || "",
    age: patient?.age || "",
    gender: patient?.gender || "",
    ...(patient?.eyeExam || {}),
  });

  if (!patient) return <Navigate to="/patients" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    updatePatientForm(patientId, "eyeExam", form);
  }

  function submit(event) {
    event.preventDefault();
    save();
    navigate(`/patients/${patientId}`);
  }

  function preview() {
    save();
    navigate(`/patients/${patientId}/eye-exam/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-6xl rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Eye Examination Form</h1>
            <p className="mt-1 text-sm text-slate-500">Record visual acuity, ophthalmic condition, and diagnostic remarks for {patient.name}.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={preview} className="button-secondary">Preview Report</button>
            <button type="submit" className="button-primary">Save Form</button>
          </div>
        </div>

        <div className="space-y-8">
          <Section title="1. Patient General Details">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} />
            <Field label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} />
            <Field label="Occupation" value={form.occupation} onChange={(value) => updateField("occupation", value)} />
            <Field label="Allergy" value={form.allergy} onChange={(value) => updateField("allergy", value)} />
            <Field label="Past Ophthalmic History" value={form.pastHistory} onChange={(value) => updateField("pastHistory", value)} />
            <Field label="Current Complaint" value={form.currentComplaint} onChange={(value) => updateField("currentComplaint", value)} />
            <Field label="Data Collected By" value={form.collectedBy} onChange={(value) => updateField("collectedBy", value)} />
          </Section>

          <Section title="2. Vision & Ocular Parameters">
            <Field label="Distant Vision Right" value={form.distantRight} onChange={(value) => updateField("distantRight", value)} />
            <Field label="Distant Vision Left" value={form.distantLeft} onChange={(value) => updateField("distantLeft", value)} />
            <Field label="Near Vision Right" value={form.nearRight} onChange={(value) => updateField("nearRight", value)} />
            <Field label="Near Vision Left" value={form.nearLeft} onChange={(value) => updateField("nearLeft", value)} />
            <Field label="Glasses Power Right" value={form.powerRight} onChange={(value) => updateField("powerRight", value)} />
            <Field label="Glasses Power Left" value={form.powerLeft} onChange={(value) => updateField("powerLeft", value)} />
            <Field label="Pupil Right" value={form.pupilRight} onChange={(value) => updateField("pupilRight", value)} />
            <Field label="Pupil Left" value={form.pupilLeft} onChange={(value) => updateField("pupilLeft", value)} />
            <Field label="Retina Right" value={form.retinaRight} onChange={(value) => updateField("retinaRight", value)} />
            <Field label="Retina Left" value={form.retinaLeft} onChange={(value) => updateField("retinaLeft", value)} />
            <div className="col-span-1 sm:col-span-2">
              <Field label="Color Vision (Ishihara)" value={form.colorVision} onChange={(value) => updateField("colorVision", value)} />
            </div>
          </Section>

          <Section title="3. Ophthalmic Functional Assessment">
            {[
              ["visualAcuityRight", "Visual Acuity Right (6/6 or 20/20?)"],
              ["visualAcuityLeft", "Visual Acuity Left (6/6 or 20/20?)"],
              ["nightVisionRight", "Impaired Night Vision Right?"],
              ["nightVisionLeft", "Impaired Night Vision Left?"],
              ["colorDefectRight", "Color Defect Right?"],
              ["colorDefectLeft", "Color Defect Left?"],
              ["diplopiaRight", "Diplopia Sign Right?"],
              ["diplopiaLeft", "Diplopia Sign Left?"],
              ["pathologyRight", "Pathological Condition Right?"],
              ["pathologyLeft", "Pathological Condition Left?"],
            ].map(([key, label]) => (
              <Choice key={key} label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
            ))}
          </Section>

          <section className="border border-line rounded-xl bg-slate-50/20 p-6">
            <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">4. Medical Conclusion & Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Conclusion" value={form.conclusion} onChange={(value) => updateField("conclusion", value)} />
              <Field label="Remarks (If Any)" value={form.remarks} onChange={(value) => updateField("remarks", value)} />
            </div>
          </section>
        </div>
      </form>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <section className="border border-line rounded-xl bg-slate-50/20 p-6">
      <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="input" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Choice({ label, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option>YES</option>
        <option>NO</option>
      </select>
    </div>
  );
}
