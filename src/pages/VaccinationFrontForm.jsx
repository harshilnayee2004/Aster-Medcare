import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialVaccinationFrontForm = {
  dataCollectedBy: "",
  formNo: "",
  name: "",
  regDate: "",
  regTime: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  age: "",
  govtIdProof: "Aadhar Card",
  govtIdProofNo: "",
  occupation: "Employee", // "Employee", "Businessman", "Student"
  occupationName: "",
  occupationId: "",
  bloodGroup: "",
  address: "",
  city: "",
  state: "",
  pin: "",
  height: "",
  weight: "",
  protectFlu: false,
  protectHepA: false,
  protectHpv: false,
  protectTyphoid: false,
  protectCovid19: false,
  protectPneumonia: false,
  protectHepB: false,
  protectMeningitis: false,
  protectVaricella: false,
  protectOther: false,
  otherSpecify: "",
  q1_physicalExam: "NO",
  q2_feverToday: "NO",
  q3_allergies: "NO",
  q3_allergicTo: "",
  q4_seriousReaction: "NO",
  q5_neurological: "NO",
  q6_vaccinesPast28: "NO",
  q6_vaccineList: "",
  q7_healthProblems: "NO",
  q8_pregnant: "NA",
  q9_immuneProblem: "NO",
  q10_weakenMedication: "NO",
  q10_medicationList: "",
  q11_transfusion: "NO",
  q11_transfusionList: "",
};

export default function VaccinationFrontForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/15-form-vaccination-front`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialVaccinationFrontForm,
              ...res.data.form.data
            });
          } else {
            // Auto populate from patient info
            setForm({
              ...initialVaccinationFrontForm,
              name: patientData.name || "",
              email: patientData.email || "",
              phone: patientData.mobile || "",
              gender: patientData.gender || "",
              dob: patientData.dob || "",
              age: patientData.age ? String(patientData.age) : "",
              bloodGroup: patientData.bloodGroup || "",
              address: patientData.address || "",
              city: patientData.city || "",
              state: patientData.state || "",
              pin: patientData.pinCode || "",
              height: patientData.height || "",
              weight: patientData.weight || "",
              govtIdProofNo: patientData.aadharNo || "",
              occupationName: patientData.company || "",
              regDate: new Date().toISOString().split("T")[0],
              regTime: new Date().toLocaleTimeString("en-US", { hour12: false }).substring(0, 5)
            });
          }
        } catch {
          setForm({
            ...initialVaccinationFrontForm,
            name: patientData.name || "",
            email: patientData.email || "",
            phone: patientData.mobile || "",
            gender: patientData.gender || "",
            dob: patientData.dob || "",
            age: patientData.age ? String(patientData.age) : "",
            bloodGroup: patientData.bloodGroup || "",
            address: patientData.address || "",
            city: patientData.city || "",
            state: patientData.state || "",
            pin: patientData.pinCode || "",
            height: patientData.height || "",
            weight: patientData.weight || "",
            govtIdProofNo: patientData.aadharNo || "",
            occupationName: patientData.company || "",
            regDate: new Date().toISOString().split("T")[0],
            regTime: new Date().toLocaleTimeString("en-US", { hour12: false }).substring(0, 5)
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
        await updatePatientForm(patientId, "15-form-vaccination-front", form);
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
      await updatePatientForm(patientId, "15-form-vaccination-front", form);
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
    navigate(`/patients/${patientId}/vaccination-front/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Vaccination Form (Front)</span>
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
          {/* Header Data */}
          <Section title="Header Details">
            <Field label="Data Collected By" value={form.dataCollectedBy} onChange={(value) => updateField("dataCollectedBy", value)} required />
            <Field label="Form No" value={form.formNo} onChange={(value) => updateField("formNo", value)} required />
            <Field label="Registration Date" type="date" value={form.regDate} onChange={(value) => updateField("regDate", value)} required />
            <Field label="Registration Time" type="time" value={form.regTime} onChange={(value) => updateField("regTime", value)} required />
          </Section>

          {/* Demographics */}
          <Section title="Candidate Demographics">
            <Field label="Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Email Id" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
            <Field label="Phone No" value={form.phone} onChange={(value) => updateField("phone", value)} />
            <Field label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} />
            <Field label="DOB" type="date" value={form.dob} onChange={(value) => updateField("dob", value)} />
            <Field label="Age" type="number" value={form.age} onChange={(value) => updateField("age", value)} />
            <Field label="Govt. ID Proof (type)" value={form.govtIdProof} onChange={(value) => updateField("govtIdProof", value)} />
            <Field label="Govt. ID Proof Number" value={form.govtIdProofNo} onChange={(value) => updateField("govtIdProofNo", value)} />
            <Field label="Blood Group" value={form.bloodGroup} onChange={(value) => updateField("bloodGroup", value)} />
          </Section>

          {/* Employment */}
          <Section title="Employment / Occupation">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Occupation Category</label>
              <select 
                className="input text-xs font-semibold text-slate-700" 
                value={form.occupation} 
                onChange={(e) => updateField("occupation", e.target.value)}
              >
                <option value="Employee">Employee</option>
                <option value="Businessman">Businessman</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <Field label="Company / School Name" value={form.occupationName} onChange={(value) => updateField("occupationName", value)} />
            <Field label="Employee / Student ID" value={form.occupationId} onChange={(value) => updateField("occupationId", value)} />
          </Section>

          {/* Address */}
          <Section title="Address details">
            <div className="col-span-1 md:col-span-2">
              <Field label="Address (Street/Line)" value={form.address} onChange={(value) => updateField("address", value)} />
            </div>
            <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
            <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} />
            <Field label="PIN No" value={form.pin} onChange={(value) => updateField("pin", value)} />
          </Section>

          {/* Vitals */}
          <Section title="Vitals">
            <Field label="Height (Cm)" type="number" value={form.height} onChange={(value) => updateField("height", value)} />
            <Field label="Weight (Kg)" type="number" value={form.weight} onChange={(value) => updateField("weight", value)} />
          </Section>

          {/* Checkboxes */}
          <Section title="Vaccine Protection checklist">
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Checkbox label="FLU" checked={form.protectFlu} onChange={(val) => updateField("protectFlu", val)} />
              <Checkbox label="HEPATITIS A" checked={form.protectHepA} onChange={(val) => updateField("protectHepA", val)} />
              <Checkbox label="HPV" checked={form.protectHpv} onChange={(val) => updateField("protectHpv", val)} />
              <Checkbox label="TYPHOID" checked={form.protectTyphoid} onChange={(val) => updateField("protectTyphoid", val)} />
              <Checkbox label="COVID-19" checked={form.protectCovid19} onChange={(val) => updateField("protectCovid19", val)} />
              <Checkbox label="PNEUMONIA" checked={form.protectPneumonia} onChange={(val) => updateField("protectPneumonia", val)} />
              <Checkbox label="HEPATITIS B" checked={form.protectHepB} onChange={(val) => updateField("protectHepB", val)} />
              <Checkbox label="MENINGITIS" checked={form.protectMeningitis} onChange={(val) => updateField("protectMeningitis", val)} />
              <Checkbox label="VARICELLA" checked={form.protectVaricella} onChange={(val) => updateField("protectVaricella", val)} />
              <Checkbox label="OTHER" checked={form.protectOther} onChange={(val) => updateField("protectOther", val)} />
            </div>
            {form.protectOther && (
              <div className="col-span-1 md:col-span-2">
                <Field label="Other (Please Specify)" value={form.otherSpecify} onChange={(value) => updateField("otherSpecify", value)} />
              </div>
            )}
          </Section>

          {/* Safety Questionnaire */}
          <Section title="Medical Safety Questionnaire">
            <RadioQuestion 
              label="Q1. Physical examination by doctor in last year?" 
              value={form.q1_physicalExam} 
              onChange={(val) => updateField("q1_physicalExam", val)} 
            />
            <RadioQuestion 
              label="Q2. Fever or illness today?" 
              value={form.q2_feverToday} 
              onChange={(val) => updateField("q2_feverToday", val)} 
            />
            <div className="col-span-1 md:col-span-2 space-y-4">
              <RadioQuestion 
                label="Q3. Allergies to vaccine components, medications, food (eggs, yeast, latex)?" 
                value={form.q3_allergies} 
                onChange={(val) => updateField("q3_allergies", val)} 
              />
              {form.q3_allergies === "YES" && (
                <Field label="Allergies Specify List" value={form.q3_allergicTo} onChange={(value) => updateField("q3_allergicTo", value)} placeholder="Specify what you are allergic to..." />
              )}
            </div>
            <RadioQuestion 
              label="Q4. Serious reaction after receiving a vaccine?" 
              value={form.q4_seriousReaction} 
              onChange={(val) => updateField("q4_seriousReaction", val)} 
            />
            <RadioQuestion 
              label="Q5. Neurological disorder, seizures, or Guillain-Barre?" 
              value={form.q5_neurological} 
              onChange={(val) => updateField("q5_neurological", val)} 
            />
            <div className="col-span-1 md:col-span-2 space-y-4">
              <RadioQuestion 
                label="Q6. Vaccines received in past 28 days?" 
                value={form.q6_vaccinesPast28} 
                onChange={(val) => updateField("q6_vaccinesPast28", val)} 
              />
              {form.q6_vaccinesPast28 === "YES" && (
                <Field label="Vaccines Specify List and Date" value={form.q6_vaccineList} onChange={(value) => updateField("q6_vaccineList", value)} placeholder="Specify vaccine name and date received..." />
              )}
            </div>
            <RadioQuestion 
              label="Q7. Health problems/allergic disorders requiring physician?" 
              value={form.q7_healthProblems} 
              onChange={(val) => updateField("q7_healthProblems", val)} 
            />
            <RadioQuestion3 
              label="Q8. For women: Pregnant, breastfeeding, or planning?" 
              value={form.q8_pregnant} 
              onChange={(val) => updateField("q8_pregnant", val)} 
            />
            <RadioQuestion 
              label="Q9. Cancer, leukemia, HIV/AIDS, or immune problems?" 
              value={form.q9_immuneProblem} 
              onChange={(val) => updateField("q9_immuneProblem", val)} 
            />
            <div className="col-span-1 md:col-span-2 space-y-4">
              <RadioQuestion 
                label="Q10. Medications weakening immune system in past 3 months?" 
                value={form.q10_weakenMedication} 
                onChange={(val) => updateField("q10_weakenMedication", val)} 
              />
              {form.q10_weakenMedication === "YES" && (
                <Field label="Medications Specify List, Dose, Date" value={form.q10_medicationList} onChange={(value) => updateField("q10_medicationList", value)} placeholder="List medication name, dose, and date..." />
              )}
            </div>
            <div className="col-span-1 md:col-span-2 space-y-4">
              <RadioQuestion 
                label="Q11. Antiviral drug or blood transfusion in past year?" 
                value={form.q11_transfusion} 
                onChange={(val) => updateField("q11_transfusion", val)} 
              />
              {form.q11_transfusion === "YES" && (
                <Field label="Transfusion/Drug Specify List, Dose, Date" value={form.q11_transfusionList} onChange={(value) => updateField("q11_transfusionList", value)} placeholder="List drug name/blood transfusion and date..." />
              )}
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

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
      <input 
        type="checkbox" 
        checked={checked || false} 
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
      />
      <span>{label}</span>
    </label>
  );
}

function RadioQuestion({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value="YES" 
            checked={value === "YES"} 
            onChange={() => onChange("YES")}
            className="h-4 w-4 text-brand focus:ring-brand"
          />
          <span>YES</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value="NO" 
            checked={value === "NO"} 
            onChange={() => onChange("NO")}
            className="h-4 w-4 text-brand focus:ring-brand"
          />
          <span>NO</span>
        </label>
      </div>
    </div>
  );
}

function RadioQuestion3({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value="YES" 
            checked={value === "YES"} 
            onChange={() => onChange("YES")}
            className="h-4 w-4 text-brand focus:ring-brand"
          />
          <span>YES</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value="NO" 
            checked={value === "NO"} 
            onChange={() => onChange("NO")}
            className="h-4 w-4 text-brand focus:ring-brand"
          />
          <span>NO</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
          <input 
            type="radio" 
            name={label} 
            value="NA" 
            checked={value === "NA"} 
            onChange={() => onChange("NA")}
            className="h-4 w-4 text-brand focus:ring-brand"
          />
          <span>N/A</span>
        </label>
      </div>
    </div>
  );
}
