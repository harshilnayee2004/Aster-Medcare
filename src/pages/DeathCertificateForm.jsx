import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialDeathForm = {
  dateTop: "",
  name: "",
  age: "",
  gender: "", // "Male" or "Female"
  sonOf: "",
  residingAtLine1: "",
  residingAtLine2: "",
  pinCode: "",
  aadharNo: "",
  visitedHomeDate: "",
  visitedHomeTime: "",
  declaredDeathTime: "",
  declaredDeathDate: "",
  primaryCause: "",
  secondaryCause: "",
  certificateTakenBy: "",
  relation: "",
};

export default function DeathCertificateForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/26-form-death-certificate`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialDeathForm,
              ...res.data.form.data
            });
          } else {
            // Auto populate from patient info
            setForm({
              ...initialDeathForm,
              name: patientData.name || "",
              age: patientData.age ? String(patientData.age) : "",
              gender: patientData.gender || "",
              sonOf: patientData.fatherName || "",
              residingAtLine1: patientData.address || "",
              dateTop: new Date().toISOString().split("T")[0],
              visitedHomeDate: new Date().toISOString().split("T")[0],
              declaredDeathDate: new Date().toISOString().split("T")[0],
            });
          }
        } catch {
          setForm({
            ...initialDeathForm,
            name: patientData.name || "",
            age: patientData.age ? String(patientData.age) : "",
            gender: patientData.gender || "",
            sonOf: patientData.fatherName || "",
            residingAtLine1: patientData.address || "",
            dateTop: new Date().toISOString().split("T")[0],
            visitedHomeDate: new Date().toISOString().split("T")[0],
            declaredDeathDate: new Date().toISOString().split("T")[0],
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
        await updatePatientForm(patientId, "26-form-death-certificate", form);
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
      await updatePatientForm(patientId, "26-form-death-certificate", form);
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
    navigate(`/patients/${patientId}/death-certificate/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Death Certificate</span>
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">1. Deceased Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Top Date" type="date" value={form.dateTop} onChange={(val) => updateField("dateTop", val)} required />
              <Field label="Mr./Mrs. (Name)" value={form.name} onChange={(val) => updateField("name", val)} required />
              <Field label="Years (Age)" type="number" value={form.age} onChange={(val) => updateField("age", val)} required />
              
              <div>
                <label className="field-label font-bold text-slate-600 mb-1.5 block">Gender</label>
                <div className="flex gap-4 items-center h-10">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Male" 
                      checked={form.gender === "Male"} 
                      onChange={() => updateField("gender", "Male")} 
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Female" 
                      checked={form.gender === "Female"} 
                      onChange={() => updateField("gender", "Female")} 
                    />
                    Female
                  </label>
                </div>
              </div>

              <Field label="Son / Daughter of" value={form.sonOf} onChange={(val) => updateField("sonOf", val)} />
              <Field label="Aadhar No." value={form.aadharNo} onChange={(val) => updateField("aadharNo", val)} />
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Residing At</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-3">
                  <Field label="Address Line 1" value={form.residingAtLine1} onChange={(val) => updateField("residingAtLine1", val)} />
                  <Field label="Address Line 2" value={form.residingAtLine2} onChange={(val) => updateField("residingAtLine2", val)} />
                </div>
                <Field label="Pin Code" value={form.pinCode} onChange={(val) => updateField("pinCode", val)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">2. Medical Verification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Home Visit Date" type="date" value={form.visitedHomeDate} onChange={(val) => updateField("visitedHomeDate", val)} />
                <Field label="Home Visit Time (e.g. 10:30 AM)" value={form.visitedHomeTime} onChange={(val) => updateField("visitedHomeTime", val)} />
                <Field label="Declared Death Date" type="date" value={form.declaredDeathDate} onChange={(val) => updateField("declaredDeathDate", val)} />
                <Field label="Declared Death Time (e.g. 11:15 AM)" value={form.declaredDeathTime} onChange={(val) => updateField("declaredDeathTime", val)} />
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2">
                <Field label="Primary Cause of Death" value={form.primaryCause} onChange={(val) => updateField("primaryCause", val)} />
                <Field label="Secondary Cause of Death" value={form.secondaryCause} onChange={(val) => updateField("secondaryCause", val)} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">3. Certificate Handover</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Certificate Taken By" value={form.certificateTakenBy} onChange={(val) => updateField("certificateTakenBy", val)} />
                <Field label="Relation to Deceased" value={form.relation} onChange={(val) => updateField("relation", val)} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-1.5">
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
