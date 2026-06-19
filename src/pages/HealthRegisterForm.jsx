import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";

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
  const patient = getPatient(patientId);
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...baseForm(patient), ...(patient?.healthRegister || {}) });

  if (!patient) return <Navigate to="/patients" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function save() {
    updatePatientForm(patientId, "healthRegister", form);
  }

  function submit(event) {
    event.preventDefault();
    save();
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
          <div className="flex gap-3">
            <button type="button" onClick={preview} className="button-secondary">Preview Report</button>
            <button type="submit" className="button-primary">Save Form</button>
          </div>
        </div>

        <div className="space-y-8">
          <Section title="1. Worker Details">
            <Field label="Serial Number" field="serialNumber" value={form.serialNumber} onChange={updateField} />
            <Field label="Name of Worker" field="name" value={form.name} onChange={updateField} />
            <Field label="Sex" field="sex" value={form.sex} onChange={updateField} />
            <Field label="Date of Birth" field="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} />
          </Section>

          <Section title="2. Department & Process Details">
            <Field label="Department Works" field="departmentWorks" value={form.departmentWorks} onChange={updateField} />
            <Field label="Name of Hazardous Process" field="hazardousProcessName" value={form.hazardousProcessName} onChange={updateField} />
            <Field label="Dangerous Process / Operation" field="dangerousOperation" value={form.dangerousOperation} onChange={updateField} />
            <Field label="Nature of Job or Occupation" field="jobNature" value={form.jobNature} onChange={updateField} />
            <Field label="Raw Materials Exposed To" field="rawMaterialsExposed" value={form.rawMaterialsExposed} onChange={updateField} />
            <Field label="Date of Posting" field="dateOfPosting" type="date" value={form.dateOfPosting} onChange={updateField} />
            <Field label="Date of Leaving / Transfer" field="dateOfLeaving" type="date" value={form.dateOfLeaving} onChange={updateField} />
            <Field label="Reasons for Discharge / Leaving" field="reasonsForLeaving" value={form.reasonsForLeaving} onChange={updateField} />
          </Section>

          <Section title="3. Medical Examination & Results">
            <Field label="Date of Examination" field="examinationDate" type="date" value={form.examinationDate} onChange={updateField} />
            <Field label="Signs and Symptoms Observed" field="signsSymptoms" value={form.signsSymptoms} onChange={updateField} />
            <Field label="Nature of Tests" field="natureOfTests" value={form.natureOfTests} onChange={updateField} />
            <Choice label="Result Status" field="result" value={form.result} onChange={updateField} options={["FIT", "UNFIT"]} />
          </Section>

          <Section title="4. If Declared Unfit for Work">
            <Field label="Period of Temporary Withdrawal" field="withdrawalPeriod" value={form.withdrawalPeriod} onChange={updateField} />
            <Field label="Reasons for Withdrawal" field="withdrawalReason" value={form.withdrawalReason} onChange={updateField} />
            <Field label="Date of Declaring Unfit" field="dateDeclaredUnfit" type="date" value={form.dateDeclaredUnfit} onChange={updateField} />
            <Field label="Date of Issuing Fitness Certificate" field="dateFitnessCertificateIssued" type="date" value={form.dateFitnessCertificateIssued} onChange={updateField} />
          </Section>

          <section className="border border-line rounded-xl bg-slate-50/20 p-6">
            <h2 className="mb-5 text-base font-bold text-slate-800 tracking-tight border-b border-line pb-2">5. Medical Officer Signature</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Signature Date & Time" field="doctorSignatureDate" type="datetime-local" value={form.doctorSignatureDate} onChange={updateField} />
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
