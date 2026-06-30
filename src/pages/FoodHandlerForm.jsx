import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialFoodHandlerForm = {
  name: "",
  companyName: "",
  date: "",
  specificNotes: "",
  doctorName: "",
};

export default function FoodHandlerForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/17-form-food-handler-certificate`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialFoodHandlerForm,
              ...res.data.form.data
            });
          } else {
            // Auto populate from patient info
            setForm({
              ...initialFoodHandlerForm,
              name: patientData.name || "",
              companyName: patientData.company || "Aster Medcare",
              date: new Date().toISOString().split("T")[0],
            });
          }
        } catch {
          setForm({
            ...initialFoodHandlerForm,
            name: patientData.name || "",
            companyName: patientData.company || "Aster Medcare",
            date: new Date().toISOString().split("T")[0],
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
        await updatePatientForm(patientId, "17-form-food-handler-certificate", form);
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
      await updatePatientForm(patientId, "17-form-food-handler-certificate", form);
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
    navigate(`/patients/${patientId}/food-handler/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Food Handler Certificate</span>
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
          <Section title="Certificate Details">
            <Field label="Candidate Name (Shri/Smt/Miss)" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Employed with M/s" value={form.companyName} onChange={(value) => updateField("companyName", value)} required />
            <Field label="Examination Date" type="date" value={form.date} onChange={(value) => updateField("date", value)} required />
            <div className="col-span-1 md:col-span-2">
              <Field label="Specific Notes, If any" value={form.specificNotes} onChange={(value) => updateField("specificNotes", value)} />
            </div>
          </Section>

          <Section title="Medical Practitioner">
            <div className="col-span-1 md:col-span-2">
              <Field label="Registered Medical Practitioner Name & Designation / Seal" value={form.doctorName} onChange={(value) => updateField("doctorName", value)} placeholder="e.g. Dr. S.V.Limbachiya, MBBS" />
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/55 p-3 flex flex-col justify-center text-center">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Candidate Signature Status</span>
              <span className={`text-xs font-bold mt-1 ${patient.signature ? "text-green-600" : "text-amber-500"}`}>
                {patient.signature ? "Signature Captured ✓" : "No Signature Captured ✗"}
              </span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", placeholder = "" }) {
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
        placeholder={placeholder}
      />
    </div>
  );
}
