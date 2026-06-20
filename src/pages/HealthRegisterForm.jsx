import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import DateField from "../components/DateField.jsx";

function baseForm(patient) {
  return {
    serialNumber: "",
    name: patient?.name || "",
    sex: patient?.gender || "",
    dateOfBirth: "",
    departmentWorks: "Manufacturing Department",
    hazardousProcessName: "NA",
    dangerousOperation: "NA",
    jobNature: "Full Time",
    rawMaterialsExposed: "NA",
    dateOfPosting: "",
    dateOfLeaving: "",
    reasonsForLeaving: "",
    examinationDate: "",
    signsSymptoms: "NO",
    natureOfTests: "Pathological , Radiological , General Checkup , Hematological",
    result: "FIT",
    withdrawalPeriod: "",
    withdrawalReason: "",
    dateDeclaredUnfit: "",
    dateFitnessCertificateIssued: "",
    doctorSignatureDate: "",
  };
}

export default function HealthRegisterForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/healthRegister`);
          if (res.data && res.data.formExists) {
            setForm({
              ...baseForm(patientData),
              ...res.data.form.data
            });
          } else {
            setForm(baseForm(patientData));
          }
        } catch {
          setForm(baseForm(patientData));
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
        await updatePatientForm(patientId, "healthRegister", form);
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
      await updatePatientForm(patientId, "healthRegister", form);
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
    navigate(`/patients/${patientId}/health-register/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Form No. 32 (Health Register)</span>
              <span className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {patient.name} <span className="font-mono text-xs font-semibold text-brand bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">{patient.patientId}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:sm-auto">
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
          <Section title="1. Worker Details">
            <Field label="Serial Number" field="serialNumber" value={form.serialNumber} onChange={updateField} />
            <Field label="Name of Worker" field="name" value={form.name} onChange={updateField} required />
            <Field label="Sex" field="sex" value={form.sex} onChange={updateField} required />
            <DateField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(val) => updateField("dateOfBirth", val)} />
          </Section>

          <Section title="2. Department & Process Details">
            <Field label="Department Works" field="departmentWorks" value={form.departmentWorks} onChange={updateField} />
            <Field label="Name of Hazardous Process" field="hazardousProcessName" value={form.hazardousProcessName} onChange={updateField} />
            <Field label="Dangerous Process / Operation" field="dangerousOperation" value={form.dangerousOperation} onChange={updateField} />
            <Field label="Nature of Job or Occupation" field="jobNature" value={form.jobNature} onChange={updateField} />
            <Field label="Raw Materials Exposed To" field="rawMaterialsExposed" value={form.rawMaterialsExposed} onChange={updateField} />
            <DateField label="Date of Posting" type="date" value={form.dateOfPosting} onChange={(val) => updateField("dateOfPosting", val)} />
            <DateField label="Date of Leaving / Transfer" type="date" value={form.dateOfLeaving} onChange={(val) => updateField("dateOfLeaving", val)} />
            <Field label="Reasons for Discharge / Leaving" field="reasonsForLeaving" value={form.reasonsForLeaving} onChange={updateField} />
          </Section>

          <Section title="3. Medical Examination & Results">
            <DateField label="Date of Examination" type="date" value={form.examinationDate} onChange={(val) => updateField("examinationDate", val)} />
            <Field label="Signs and Symptoms Observed" field="signsSymptoms" value={form.signsSymptoms} onChange={updateField} />
            <Field label="Nature of Tests" field="natureOfTests" value={form.natureOfTests} onChange={updateField} />
            <Choice label="Result Status" field="result" value={form.result} onChange={updateField} options={["FIT", "UNFIT"]} required />
          </Section>

          <Section title="4. If Declared Unfit for Work">
            <Field label="Period of Temporary Withdrawal" field="withdrawalPeriod" value={form.withdrawalPeriod} onChange={updateField} />
            <Field label="Reasons for Withdrawal" field="withdrawalReason" value={form.withdrawalReason} onChange={updateField} />
            <DateField label="Date of Declaring Unfit" type="date" value={form.dateDeclaredUnfit} onChange={(val) => updateField("dateDeclaredUnfit", val)} />
            <DateField label="Date of Issuing Fitness Certificate" type="date" value={form.dateFitnessCertificateIssued} onChange={(val) => updateField("dateFitnessCertificateIssued", val)} />
          </Section>

          {/* Section 5 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">5. Medical Officer Signature</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DateField label="Signature Date & Time" type="datetime-local" value={form.doctorSignatureDate} onChange={(val) => updateField("doctorSignatureDate", val)} />
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

function Field({ label, field, value, onChange, type = "text", required }) {
  const id = `form32-${field}`;
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input id={id} type={type} className="input text-xs font-semibold text-slate-700" value={value || ""} onChange={(event) => onChange(field, event.target.value)} />
    </div>
  );
}

function Choice({ label, field, value, onChange, options = ["Yes", "No"], required }) {
  const id = `form32-${field}`;
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select id={id} className="input !py-2 text-xs font-semibold text-slate-700" value={value} onChange={(event) => onChange(field, event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
