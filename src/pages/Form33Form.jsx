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
    fatherHusbandName: patient?.fatherName || "",
    sex: patient?.gender || "",
    residence: patient?.address || "",
    pinCode: "",
    city: "",
    state: "",
    dateOfBirth: "",
    factoryName: patient?.company || "",
    factoryAddress: "",
    hazardousProcess: "No",
    hazardousArea: "",
    dangerousOperation: "No",
    dangerousArea: "",
    identificationMarks: patient?.identificationMarks || "",
    employedIn: "",
    examinedAge: patient?.age || "",
    fitStatus: "FIT",
    unfitReason: "",
    previousCertificate: "",
    examinationDate: "",
    extensionNote: "",
    symptoms: "",
    doctorSignatureDate: "",
  };
}

export default function Form33Form() {
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
          const res = await api.get(`/patients/${patientId}/forms/form33`);
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
        await updatePatientForm(patientId, "form33", form);
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
      await updatePatientForm(patientId, "form33", form);
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
    navigate(`/patients/${patientId}/form-33/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-6xl rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Form No. 33</h1>
            <p className="mt-1 text-sm text-slate-500">Certificate of Fitness of employment in hazardous process and operations for {patient.name}.</p>
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
            <Field label="Name of Person Examined" field="name" value={form.name} onChange={updateField} />
            <Field label="Father's / Husband Name" field="fatherHusbandName" value={form.fatherHusbandName} onChange={updateField} />
            <Field label="Sex" field="sex" value={form.sex} onChange={updateField} />
            <Field label="Residence Address" field="residence" value={form.residence} onChange={updateField} />
            <Field label="Pin Code" field="pinCode" value={form.pinCode} onChange={updateField} />
            <Field label="City" field="city" value={form.city} onChange={updateField} />
            <Field label="State" field="state" value={form.state} onChange={updateField} />
            <DateField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(val) => updateField("dateOfBirth", val)} />
            <Field label="Examined Age (Years)" field="examinedAge" value={form.examinedAge} onChange={updateField} />
          </Section>

          <Section title="2. Factory & Employment Details">
            <Field label="Factory Name" field="factoryName" value={form.factoryName} onChange={updateField} />
            <Field label="Factory Address" field="factoryAddress" value={form.factoryAddress} onChange={updateField} />
            <Choice label="Hazardous Process?" field="hazardousProcess" value={form.hazardousProcess} onChange={updateField} />
            <Field label="Hazardous Process Area" field="hazardousArea" value={form.hazardousArea} onChange={updateField} />
            <Choice label="Dangerous Operation?" field="dangerousOperation" value={form.dangerousOperation} onChange={updateField} />
            <Field label="Dangerous Operation Area" field="dangerousArea" value={form.dangerousArea} onChange={updateField} />
            <Field label="Desirous of Being Employed In" field="employedIn" value={form.employedIn} onChange={updateField} />
            <Field label="Identification Marks" field="identificationMarks" value={form.identificationMarks} onChange={updateField} />
          </Section>

          <Section title="3. Fitness Evaluation & Signature">
            <Choice label="Fit Status" field="fitStatus" value={form.fitStatus} onChange={updateField} options={["FIT", "UNFIT"]} />
            <Field label="Unfit Reason" field="unfitReason" value={form.unfitReason} onChange={updateField} />
            <Field label="Previous Certificate Serial No." field="previousCertificate" value={form.previousCertificate} onChange={updateField} />
            <DateField label="Date of Examination" type="date" value={form.examinationDate} onChange={(val) => updateField("examinationDate", val)} />
            <Field label="Extension / Unfit Note" field="extensionNote" value={form.extensionNote} onChange={updateField} />
            <Field label="Observed Signs & Symptoms" field="symptoms" value={form.symptoms} onChange={updateField} />
            <div className="col-span-1 sm:col-span-2">
              <DateField label="Doctor Signature Date & Time" type="datetime-local" value={form.doctorSignatureDate} onChange={(val) => updateField("doctorSignatureDate", val)} />
            </div>
          </Section>
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
  const id = `form33-${field}`;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className="input" value={value} onChange={(event) => onChange(field, event.target.value)} />
    </div>
  );
}

function Choice({ label, field, value, onChange, options = ["Yes", "No"] }) {
  const id = `form33-${field}`;

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} className="input" value={value} onChange={(event) => onChange(field, event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
