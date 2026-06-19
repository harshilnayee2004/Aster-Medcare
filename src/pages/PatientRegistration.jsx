import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatients, upsertPatient } from "../utils/localStorage.js";
import { generatePatientId } from "../utils/patientId.js";

const initialForm = {
  name: "",
  age: "",
  gender: "Male",
  mobile: "",
  company: "",
  address: "",
  photo: "",
};

export default function PatientRegistration() {
  const [form, setForm] = useState(initialForm);
  const navigate = useNavigate();
  const patientId = generatePatientId(getPatients());

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField("photo", reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const patient = { ...form, patientId, createdAt: new Date().toISOString() };
    upsertPatient(patient);
    navigate(`/patients/${patientId}`);
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl rounded-lg border border-line bg-white p-8 shadow-soft">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Patient Registration</h1>
            <p className="mt-2 text-muted">Generated Patient ID: <span className="font-medium text-brand">{patientId}</span></p>
          </div>
          <button className="button-primary" type="submit">Save Patient</button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
          <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
          <div>
            <label className="field-label">Gender</label>
            <select className="input" value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <Field label="Mobile Number" value={form.mobile} onChange={(value) => updateField("mobile", value)} />
          <Field label="Company Name" value={form.company} onChange={(value) => updateField("company", value)} />
          <div>
            <label className="field-label">Photo Upload</label>
            <input className="input file:mr-4 file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm" type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files[0])} />
          </div>
          <div className="col-span-2">
            <label className="field-label" htmlFor="address">Address</label>
            <textarea id="address" className="input min-h-28" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, value, onChange, required }) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} className="input" value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
