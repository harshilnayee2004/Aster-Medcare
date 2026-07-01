import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialEyeExam = {
  collectedBy: "",
  collectedDate: "",
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
  pathologyCondition: "",
  remarks: "NA",
  conclusion: "Normal Eye Vision Fit For Job",
  squint: "Absent",
  squintRemarks: "NA",
  binocularity: "Normal",
  binocularityRemarks: "NA",
  stereoDepth: "Normal",
  stereoDepthRemarks: "NA",
  peripheralVision: "Normal",
  peripheralVisionRemarks: "NA",
  muscleStrength: "Normal",
  muscleStrengthRemarks: "NA",
  doctorSignatureDate: "",
};

export default function EyeExamForm() {
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
        
        try {
          const res = await api.get(`/patients/${patientId}/forms/eyeExam`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialEyeExam,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
              ...res.data.form.data
            });
          } else {
            setForm({
              ...initialEyeExam,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
            });
          }
        } catch {
          setForm({
            ...initialEyeExam,
            name: patientData.name || "",
            age: patientData.age || "",
            gender: patientData.gender || "",
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

  // Debounced auto-save
  useEffect(() => {
    if (!form || loading) return;

    setSaveStatus("Saving...");
    const timer = setTimeout(async () => {
      try {
        await updatePatientForm(patientId, "eyeExam", form);
        setSaveStatus("Saved ✓");
      } catch (err) {
        console.error("Auto-save failed:", err);
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
      await updatePatientForm(patientId, "eyeExam", form);
      setSaveStatus("Saved ✓");
    } catch {
      setSaveStatus("Error ✗");
    }
  }

  async function submit(event) {
    event.preventDefault();
    await save();
    navigate(`/patients/${patientId}`);
  }

  function preview() {
    save();
    navigate(`/patients/${patientId}/eye-exam/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
        {/* Breadcrumb link */}
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Eye Examination</span>
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

        <div className="space-y-6">
          <Section title="1. Patient General Details">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
            <Field label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} required />
            <Field label="Occupation" value={form.occupation} onChange={(value) => updateField("occupation", value)} />
            <Field label="Allergy" value={form.allergy} onChange={(value) => updateField("allergy", value)} />
            <Field label="Past Ophthalmic History" value={form.pastHistory} onChange={(value) => updateField("pastHistory", value)} />
            <Field label="Current Complaint" value={form.currentComplaint} onChange={(value) => updateField("currentComplaint", value)} />
            <Field label="Data Collected By" value={form.collectedBy} onChange={(value) => updateField("collectedBy", value)} />
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">General Info Date</label>
              <input type="date" className="input text-xs font-semibold text-slate-700" value={form.collectedDate || ""} onChange={(e) => updateField("collectedDate", e.target.value)} />
            </div>
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
            <div className="col-span-1 md:col-span-2">
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
            <div className="col-span-1 md:col-span-2">
              <Field label="If Pathological Condition Yes, What Condition?" value={form.pathologyCondition} onChange={(value) => updateField("pathologyCondition", value)} />
            </div>
          </Section>

          <Section title="4. Specific Titmus (Drivers / Security / Canteen Staff)">
            <Choice label="Squint" value={form.squint} onChange={(value) => updateField("squint", value)} options={["Present", "Absent"]} />
            <Field label="Squint Remarks" value={form.squintRemarks} onChange={(value) => updateField("squintRemarks", value)} />
            <Choice label="Binocularity" value={form.binocularity} onChange={(value) => updateField("binocularity", value)} options={["Normal", "Abnormal"]} />
            <Field label="Binocularity Remarks" value={form.binocularityRemarks} onChange={(value) => updateField("binocularityRemarks", value)} />
            <Choice label="Stereo Depth" value={form.stereoDepth} onChange={(value) => updateField("stereoDepth", value)} options={["Normal", "Abnormal"]} />
            <Field label="Stereo Depth Remarks" value={form.stereoDepthRemarks} onChange={(value) => updateField("stereoDepthRemarks", value)} />
            <Choice label="Peripheral Vision" value={form.peripheralVision} onChange={(value) => updateField("peripheralVision", value)} options={["Normal", "Abnormal"]} />
            <Field label="Peripheral Vision Remarks" value={form.peripheralVisionRemarks} onChange={(value) => updateField("peripheralVisionRemarks", value)} />
            <Choice label="Muscle Strength" value={form.muscleStrength} onChange={(value) => updateField("muscleStrength", value)} options={["Normal", "Abnormal"]} />
            <Field label="Muscle Strength Remarks" value={form.muscleStrengthRemarks} onChange={(value) => updateField("muscleStrengthRemarks", value)} />
          </Section>

          {/* Section 5 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">5. Medical Conclusion & Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Conclusion" value={form.conclusion} onChange={(value) => updateField("conclusion", value)} />
              <Field label="Remarks (If Any)" value={form.remarks} onChange={(value) => updateField("remarks", value)} />
              <div className="col-span-1 md:col-span-2">
                <div>
                  <label className="field-label font-bold text-slate-600 mb-2">Doctor Signature Date & Time</label>
                  <input type="datetime-local" className="input text-xs font-semibold text-slate-700" value={form.doctorSignatureDate || ""} onChange={(e) => updateField("doctorSignatureDate", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input className="input text-xs font-semibold text-slate-700" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Choice({ label, value, onChange, options = ["YES", "NO"], required }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="input !py-2 text-xs font-semibold text-slate-700" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
