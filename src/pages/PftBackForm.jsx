import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const initialPftBack = {
  name: "",
  age: "",
  phoneNo: "",
  peakFlowReading: "",
  zoneIndication: "Green Zone - Safe",
  recommendation: "No Any.",
  conclusionComment: "Normal Peak Flow and Expiratory flow rate test.",
  date: new Date().toISOString().slice(0, 10),
  pftChart: "",
};

export default function PftBackForm() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved ✓");
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const patientData = await getPatient(patientId);
        setPatient(patientData);
        
        try {
          const res = await api.get(`/patients/${patientId}/forms/14-form-pft-back`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialPftBack,
              name: patientData.name || "",
              age: patientData.age || "",
              phoneNo: patientData.mobile || "",
              ...res.data.form.data
            });
          } else {
            setForm({
              ...initialPftBack,
              name: patientData.name || "",
              age: patientData.age || "",
              phoneNo: patientData.mobile || "",
            });
          }
        } catch {
          setForm({
            ...initialPftBack,
            name: patientData.name || "",
            age: patientData.age || "",
            phoneNo: patientData.mobile || "",
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
        await updatePatientForm(patientId, "14-form-pft-back", form);
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

  function handleImageUpload(field, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField(field, reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaveStatus("Saving...");
    try {
      await updatePatientForm(patientId, "14-form-pft-back", form);
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
    navigate(`/patients/${patientId}/pft-back/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">14 FORM PFT Back</span>
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
          <Section title="1. Patient Information">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
            <Field label="Phone Number" value={form.phoneNo} onChange={(value) => updateField("phoneNo", value)} required />
          </Section>

          <Section title="2. Pulmonary Parameters & Evaluation">
            <Field label="Peak Flow Meter Reading" value={form.peakFlowReading} onChange={(value) => updateField("peakFlowReading", value)} placeholder="e.g. 450 L/min" />
            <div className="col-span-1">
              <label className="field-label font-bold text-slate-600 mb-2">Zone Indication</label>
              <select 
                className="input !py-2 text-xs font-semibold text-slate-700" 
                value={form.zoneIndication} 
                onChange={(e) => updateField("zoneIndication", e.target.value)}
              >
                <option value="Green Zone - Safe">Green Zone - Safe</option>
                <option value="Yellow Zone - Caution">Yellow Zone - Caution</option>
                <option value="Red Zone - Alert">Red Zone - Alert</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Recommendation" value={form.recommendation} onChange={(value) => updateField("recommendation", value)} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="field-label font-bold text-slate-600 mb-2">Conclusion & Comment</label>
              <textarea 
                className="input min-h-[80px] text-xs font-semibold text-slate-700" 
                value={form.conclusionComment} 
                onChange={(e) => updateField("conclusionComment", e.target.value)}
              />
            </div>
            <Field label="Date" type="date" value={form.date} onChange={(value) => updateField("date", value)} />
          </Section>

          {/* PFT Chart Image Upload */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">PFT Chart Image Upload (Optional)</h2>
            <ImageUploadField 
              id="pftChart" 
              value={form.pftChart} 
              onUpload={(file) => handleImageUpload("pftChart", file)} 
              onClear={() => updateField("pftChart", "")} 
            />
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
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

function ImageUploadField({ id, value, onUpload, onClear }) {
  return (
    <div>
      {!value ? (
        <div className="flex justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-8 transition hover:border-brand bg-slate-50/50">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="mt-3 flex text-xs text-slate-600 justify-center">
              <label htmlFor={`${id}-upload`} className="relative cursor-pointer rounded-md font-bold text-brand focus-within:outline-none hover:text-blue-700">
                <span>Upload a file</span>
                <input id={`${id}-upload`} type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(e.target.files[0])} />
              </label>
              <p className="pl-1 text-slate-400 font-medium">or drag and drop</p>
            </div>
            <p className="text-xxs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden flex items-center justify-between">
          <img src={value} alt="Preview" className="max-h-48 w-auto rounded-xl object-contain shadow-sm" />
          <button 
            type="button" 
            onClick={onClear} 
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 text-xs rounded-xl transition border border-red-200/50"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}
