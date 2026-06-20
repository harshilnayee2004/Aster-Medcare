import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
      <form onSubmit={submit} className="mx-auto max-w-6xl rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Form No. 32</h1>
            <p className="mt-1 text-sm text-slate-500">Health Register diagnostics and medical observation tracking for {patient.name}.</p>
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
          <Section title="1. Worker Details">
            <Field label="Serial Number" field="serialNumber" value={form.serialNumber} onChange={updateField} />
            <Field label="Name of Worker" field="name" value={form.name} onChange={updateField} />
            <Field label="Sex" field="sex" value={form.sex} onChange={updateField} />
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
            <Choice label="Result Status" field="result" value={form.result} onChange={updateField} options={["FIT", "UNFIT"]} />
          </Section>

          <Section title="4. If Declared Unfit for Work">
            <Field label="Period of Temporary Withdrawal" field="withdrawalPeriod" value={form.withdrawalPeriod} onChange={updateField} />
            <Field label="Reasons for Withdrawal" field="withdrawalReason" value={form.withdrawalReason} onChange={updateField} />
            <DateField label="Date of Declaring Unfit" type="date" value={form.dateDeclaredUnfit} onChange={(val) => updateField("dateDeclaredUnfit", val)} />
            <DateField label="Date of Issuing Fitness Certificate" type="date" value={form.dateFitnessCertificateIssued} onChange={(val) => updateField("dateFitnessCertificateIssued", val)} />
          </Section>

          <section className="border border-line rounded-xl bg-slate-50/20 p-6">
            <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">5. Medical Officer Signature</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DateField label="Signature Date & Time" type="datetime-local" value={form.doctorSignatureDate} onChange={(val) => updateField("doctorSignatureDate", val)} />
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

function Field({ label, field, value, onChange, type = "text" }) {
  const id = `form32-${field}`;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className="input" value={value} onChange={(event) => onChange(field, event.target.value)} />
    </div>
  );
}

function Choice({ label, field, value, onChange, options = ["Yes", "No"] }) {
  const id = `form32-${field}`;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} className="input" value={value} onChange={(event) => onChange(field, event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
