import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialPreMedical = {
  collectedBy: "",
  formNo: "",
  name: "",
  dateTime: "",
  address: "",
  city: "",
  state: "",
  pinNo: "",
  emailId: "",
  phoneNo: "",
  gender: "",
  dob: "",
  age: "",
  govtIdProof: "",
  govtIdProofNo: "",
  occupation: "",
  occupationName: "",
  occupationId: "",
  bloodGroup: "",
  post: "",
  // Disease flags
  asthma: "NO",
  tb: "NO",
  fits: "NO",
  mental: "NO",
  eyeDisease: "NO",
  heartDisease: "NO",
  skinDisease: "NO",
  injuryFracture: "NO",
  surgery: "NO",
  infectiousDisease: "NO",
  // Personal details
  diet: "",
  allergy: "NO",
  addiction: "NO",
  addictionQty: "",
  otherIllness: "NO",
  familyBp: false,
  familyDiabetes: false,
  familyHeart: false,
  familyCancer: false,
  identificationMark: "",
  otherDetails: "NA",
  verifiedBy: "",
  verifiedDateTime: ""
};

export default function PreMedicalForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/preMedical`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialPreMedical,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
              address: patientData.address || "",
              phoneNo: patientData.mobile || "",
              ...res.data.form.data
            });
          } else {
            setForm({
              ...initialPreMedical,
              name: patientData.name || "",
              age: patientData.age || "",
              gender: patientData.gender || "",
              address: patientData.address || "",
              phoneNo: patientData.mobile || "",
            });
          }
        } catch {
          setForm({
            ...initialPreMedical,
            name: patientData.name || "",
            age: patientData.age || "",
            gender: patientData.gender || "",
            address: patientData.address || "",
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
        await updatePatientForm(patientId, "preMedical", form);
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
      await updatePatientForm(patientId, "preMedical", form);
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
    navigate(`/patients/${patientId}/pre-medical/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Pre Medical Check-Up Form</span>
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
          <Section title="1. Patient Personal Details">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
            <Field label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} required />
            <Field label="Form No" value={form.formNo} onChange={(value) => updateField("formNo", value)} />
            <Field label="Date & Time" type="datetime-local" value={form.dateTime} onChange={(value) => updateField("dateTime", value)} />
            <Field label="Email Id" value={form.emailId} onChange={(value) => updateField("emailId", value)} />
            <Field label="Phone No" value={form.phoneNo} onChange={(value) => updateField("phoneNo", value)} />
            <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => updateField("dob", value)} />
            <Field label="GOVT. ID Proof" value={form.govtIdProof} onChange={(value) => updateField("govtIdProof", value)} />
            <Field label="GOVT. ID Proof No" value={form.govtIdProofNo} onChange={(value) => updateField("govtIdProofNo", value)} />
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">
                Blood Group
              </label>
              <select
                className="input !py-2 text-xs font-semibold text-slate-700"
                value={form.bloodGroup || ""}
                onChange={(e) => updateField("bloodGroup", e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <Field label="Post / Designation" value={form.post} onChange={(value) => updateField("post", value)} />
            <Field label="Occupation" value={form.occupation} onChange={(value) => updateField("occupation", value)} />
            <Field label="Occupation Name" value={form.occupationName} onChange={(value) => updateField("occupationName", value)} />
            <Field label="Occupation ID" value={form.occupationId} onChange={(value) => updateField("occupationId", value)} />
            <Field label="Data Collected By" value={form.collectedBy} onChange={(value) => updateField("collectedBy", value)} />
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Field label="Full Address" value={form.address} onChange={(value) => updateField("address", value)} />
            </div>
            <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
            <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} />
            <Field label="Pin No" value={form.pinNo} onChange={(value) => updateField("pinNo", value)} />
          </Section>

          <Section title="2. Past or Present Illness History (ભૂતકાળ કે વર્તમાન માંદગી નો ઈતિહાસ)">
            {[
              ["asthma", "દમ / Asthma"],
              ["tb", "ક્ષય / ટીબી / TB / Tuberculosis"],
              ["fits", "ખેંચ / હિસ્ટિરિયા / વાઈ (Fits / Epilepsy)"],
              ["mental", "માનસીક રોગ / Mental Illness"],
              ["eyeDisease", "આંખના રોગ / Eye Disease"],
              ["heartDisease", "હૃદયરોગ / Heart Disease"],
              ["skinDisease", "ચામડીના રોગ / Skin Disease"],
              ["injuryFracture", "જુની મોટી ઈજા કે ફ્રેક્ચર (Old Major Injury / Fracture)"],
              ["surgery", "ઓપરેશન / Surgery"],
              ["infectiousDisease", "ડેન્ગ્યુ, મલેરિયા, કમળો, ટાઈફોઈડ (Dengue/Malaria/Jaundice/Typhoid)"],
            ].map(([key, label]) => (
              <Choice key={key} label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
            ))}
          </Section>

          <Section title="3. Personal Info & Family History (અંગત માહિતી)">
            <Field label="ખોરાક / Diet (e.g. Veg / Non-Veg)" value={form.diet} onChange={(value) => updateField("diet", value)} />
            <Field label="એલર્જી / Allergy" value={form.allergy} onChange={(value) => updateField("allergy", value)} />
            <Field label="વ્યસન / Addiction / Habits" value={form.addiction} onChange={(value) => updateField("addiction", value)} />
            <Field label="વ્યસન જથ્થો / Addiction Qty" value={form.addictionQty} onChange={(value) => updateField("addictionQty", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="અન્ય બિમારી / Other Illness" value={form.otherIllness} onChange={(value) => updateField("otherIllness", value)} />
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <span className="field-label font-bold text-slate-700">કૌટુંબિક ઇતિહાસ / Family History (Check all that apply)</span>
              <div className="flex flex-wrap gap-6 pt-1">
                {[
                  ["familyBp", "બ્લડ પ્રેશર / Blood Pressure"],
                  ["familyDiabetes", "ડાયાબિટીસ / Diabetes"],
                  ["familyHeart", "હૃદય રોગ / Heart Disease"],
                  ["familyCancer", "કેન્સર / Cancer"]
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4"
                      checked={form[key]} 
                      onChange={(e) => updateField(key, e.target.checked)} 
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Section title="4. Physical Marks & Verification">
            <div className="col-span-1 md:col-span-2">
              <Field label="Identification Mark" value={form.identificationMark} onChange={(value) => updateField("identificationMark", value)} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Other Details" value={form.otherDetails} onChange={(value) => updateField("otherDetails", value)} />
            </div>
            <Field label="Details Verified By" value={form.verifiedBy} onChange={(value) => updateField("verifiedBy", value)} />
            <Field label="Verification Date & Time" type="datetime-local" value={form.verifiedDateTime} onChange={(value) => updateField("verifiedDateTime", value)} />
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

function Choice({ label, value, onChange, required }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select 
        className="input !py-2 text-xs font-semibold text-slate-700" 
        value={value} 
        onChange={(event) => onChange(event.target.value)}
      >
        <option>YES</option>
        <option>NO</option>
      </select>
    </div>
  );
}
