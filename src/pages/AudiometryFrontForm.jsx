import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const initialAudiometryFront = {
  collectedBy: "",
  formNo: "",
  company: "",
  dateTop: new Date().toISOString().slice(0, 10),
  timeTop: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
  name: "",
  age: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pinNo: "",
  phoneNo: "",
  occupation: "",
  q1: "NO",
  q1_details: "",
  q2: "NO",
  q3: "NO",
  q4: "NO",
  q5: "NO",
  q6: "NO",
  q6_details: "",
  q7: "NO",
  q8: "NO",
  q9: "NO",
  q10: "NO",
  dateBottom: new Date().toISOString().slice(0, 10),
  doctorStamp: "Aster Medcare",
};

export default function AudiometryFrontForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/11-form-audiometry-front`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialAudiometryFront,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
              address: patientData.address || "",
              phoneNo: patientData.mobile || "",
              occupation: patientData.occupation || "",
              ...res.data.form.data,
              collectedBy: res.data.form.data.collectedBy || currentUser?.name || ""
            });
          } else {
            setForm({
              ...initialAudiometryFront,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
              address: patientData.address || "",
              phoneNo: patientData.mobile || "",
              occupation: patientData.occupation || "",
              collectedBy: currentUser?.name || ""
            });
          }
        } catch {
          setForm({
            ...initialAudiometryFront,
            name: patientData.name || "",
            age: patientData.age || "",
            gender: patientData.gender || "",
            address: patientData.address || "",
            phoneNo: patientData.mobile || "",
            occupation: patientData.occupation || "",
            collectedBy: currentUser?.name || ""
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
        await updatePatientForm(patientId, "11-form-audiometry-front", form);
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
      await updatePatientForm(patientId, "11-form-audiometry-front", form);
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
    navigate(`/patients/${patientId}/audiometry-front/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Audiometry Report (Front)</span>
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
            <Field label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} required />
            <Field label="Company Name" value={form.company} onChange={(value) => updateField("company", value)} />
            <Field label="Form No" value={form.formNo} onChange={(value) => updateField("formNo", value)} />
            <Field label="Data Collected By" value={form.collectedBy} onChange={(value) => updateField("collectedBy", value)} />
            <Field label="Top Date" type="date" value={form.dateTop} onChange={(value) => updateField("dateTop", value)} />
            <Field label="Top Time" type="time" value={form.timeTop} onChange={(value) => updateField("timeTop", value)} />
          </Section>

          <Section title="2. Demographics & Contact">
            <div className="col-span-1 md:col-span-2">
              <Field label="Full Address" value={form.address} onChange={(value) => updateField("address", value)} />
            </div>
            <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
            <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} />
            <Field label="Pin Code" value={form.pinNo} onChange={(value) => updateField("pinNo", value)} />
            <Field label="Mobile No" value={form.phoneNo} onChange={(value) => updateField("phoneNo", value)} />
            <Field label="Occupation" value={form.occupation} onChange={(value) => updateField("occupation", value)} />
          </Section>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">3. Persons Questionnaire</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <QuestionChoice label="1. Any Ear problem or defect Now or In Past?" value={form.q1} onChange={(val) => updateField("q1", val)} />
              {form.q1 === "YES" && (
                <Field label="If Yes, describe problem" value={form.q1_details} onChange={(val) => updateField("q1_details", val)} />
              )}
              <QuestionChoice label="2. Difficulty in understanding speech from distance?" value={form.q2} onChange={(val) => updateField("q2", val)} />
              <QuestionChoice label="3. History of any Medical Problem / Specific Illness?" value={form.q3} onChange={(val) => updateField("q3", val)} />
              <QuestionChoice label="4. Any Ear discharge?" value={form.q4} onChange={(val) => updateField("q4", val)} />
              <QuestionChoice label="5. Any History of Giddiness / Vertigo Right Now or in past?" value={form.q5} onChange={(val) => updateField("q5", val)} />
              <QuestionChoice label="6. Do You have allergies?" value={form.q6} onChange={(val) => updateField("q6", val)} />
              {form.q6 === "YES" && (
                <Field label="If Yes, describe allergy" value={form.q6_details} onChange={(val) => updateField("q6_details", val)} />
              )}
              <QuestionChoice label="7. Do You have Tinnitus / Ringing Sound in Ear?" value={form.q7} onChange={(val) => updateField("q7", val)} />
              <QuestionChoice label="8. History of any Ear Surgery?" value={form.q8} onChange={(val) => updateField("q8", val)} />
              <QuestionChoice label="9. History of hearing loss in family?" value={form.q9} onChange={(val) => updateField("q9", val)} />
              <QuestionChoice label="10. Have you consulted of any ENT Doctor or Audiologist in past?" value={form.q10} onChange={(val) => updateField("q10", val)} />
            </div>
          </div>

          <Section title="4. Verification & Stamp Details">
            <Field label="Bottom Verification Date" type="date" value={form.dateBottom} onChange={(value) => updateField("dateBottom", value)} />
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

function QuestionChoice({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50">
      <span className="text-xs font-bold text-slate-600 mr-4">{label}</span>
      <select 
        className="input !py-1.5 !w-24 text-xs font-semibold text-slate-700" 
        value={value} 
        onChange={(event) => onChange(event.target.value)}
      >
        <option>NO</option>
        <option>YES</option>
      </select>
    </div>
  );
}
