import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialOphthalForm6 = {
  dateTop: new Date().toISOString().slice(0, 10),
  department: "",
  name: "",
  sex: "",
  dob: "",
  age: "",
  occupation: "",
  dateOfEmployment: "",
  examinationDate: new Date().toISOString().slice(0, 10),
  examinationResult: "Normal Eye Vision Fit For Job",
  remarks: "NA",
  doctorSignatureRow: "Dr. Patel, MD",
  dateBottom: new Date().toISOString().slice(0, 10),
  doctorStamp: "Aster Medcare",
};

export default function OphthalForm6Form() {
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
          const res = await api.get(`/patients/${patientId}/forms/10-form-ophthal-form-6`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialOphthalForm6,
              name: patientData.name || "",
              age: patientData.age || "",
              sex: patientData.gender || "",
              dob: patientData.dob ? patientData.dob.slice(0, 10) : "",
              occupation: patientData.occupation || "",
              ...res.data.form.data
            });
          } else {
            setForm({
              ...initialOphthalForm6,
              name: patientData.name || "",
              age: patientData.age || "",
              sex: patientData.gender || "",
              dob: patientData.dob ? patientData.dob.slice(0, 10) : "",
              occupation: patientData.occupation || "",
            });
          }
        } catch {
          setForm({
            ...initialOphthalForm6,
            name: patientData.name || "",
            age: patientData.age || "",
            sex: patientData.gender || "",
            dob: patientData.dob ? patientData.dob.slice(0, 10) : "",
            occupation: patientData.occupation || "",
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
        await updatePatientForm(patientId, "10-form-ophthal-form-6", form);
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
      await updatePatientForm(patientId, "10-form-ophthal-form-6", form);
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
    navigate(`/patients/${patientId}/ophthal-form-6/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Ophthalmic Form 6</span>
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
          <Section title="1. Patient & General Info">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
            <Field label="Gender" value={form.sex} onChange={(value) => updateField("sex", value)} required />
            <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => updateField("dob", value)} required />
            <Field label="Department / Works" value={form.department} onChange={(value) => updateField("department", value)} />
            <Field label="Top Form Date" type="date" value={form.dateTop} onChange={(value) => updateField("dateTop", value)} />
          </Section>

          <Section title="2. Employment & Examination Details">
            <Field label="Occupation" value={form.occupation} onChange={(value) => updateField("occupation", value)} />
            <Field label="Date of Employment" type="date" value={form.dateOfEmployment} onChange={(value) => updateField("dateOfEmployment", value)} />
            <Field label="Examination Date" type="date" value={form.examinationDate} onChange={(value) => updateField("examinationDate", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="Result of Eye Examination" value={form.examinationResult} onChange={(value) => updateField("examinationResult", value)} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Remarks" value={form.remarks} onChange={(value) => updateField("remarks", value)} />
            </div>
          </Section>

          <Section title="3. Verification & Stamp Details">
            <Field label="Bottom Verification Date" type="date" value={form.dateBottom} onChange={(value) => updateField("dateBottom", value)} />
            <Field label="Doctor Stamp / Signature text" value={form.doctorSignatureRow} onChange={(value) => updateField("doctorSignatureRow", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="Doctor Stamp Details" value={form.doctorStamp} onChange={(value) => updateField("doctorStamp", value)} />
            </div>
          </Section>
        </div>
      </form>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5 animate-fade-in">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        className="input text-xs font-semibold text-slate-700" 
        value={value || ""} 
        onChange={(event) => onChange(event.target.value)} 
      />
    </div>
  );
}
