import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialAirportBohw = {
  certificateSerialNo: "",
  dateTop: "",
  name: "",
  identificationMarks: "",
  fatherName: "",
  sex: "",
  mobileNo: "",
  residence: "",
  dob: "",
  aadharNo: "",
  height: "",
  weight: "",
  bloodPressure: "",
  pulse: "",
  hearing: "Normal",
  refractiveError: "",
  colourVision: "Normal",
  anyDisability: "None",
  armFunctionGrip: "Normal",
  legFootFunction: "Normal",
  varicose: "NO",
  seizure: "NO",
  vertigo: "NO",
  acrophobia: "NO",
  diabetes: "NO",
  stroke: "NO",
  heartDiseases: "NO",
  majorIllnessOrSurgery: "NO",
  symptomsVisible: "NO",
  othersIfAny: "None",
  residingAt: "",
  fitForEmploymentIn: "",
  ascertainedAge: "",
  fitStatus: "FIT",
  reasonRefusal: "",
  reasonRevoked: "",
  companyName: ""
};

export default function AirportBohwForm() {
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
        
        let dobVal = "";
        if (patientData.dob) {
          dobVal = patientData.dob; // already YYYY-MM-DD
        }

        try {
          const res = await api.get(`/patients/${patientId}/forms/4-form-airport-bohw`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialAirportBohw,
              name: patientData.name || "",
              fatherName: patientData.fatherName || "",
              sex: patientData.gender || "",
              mobileNo: patientData.mobile || "",
              residence: patientData.address || "",
              residingAt: patientData.address || "",
              dob: dobVal,
              aadharNo: patientData.aadharNo || "",
              ascertainedAge: String(patientData.age || ""),
              companyName: patientData.company || "Aster Medcare",
              ...res.data.form.data
            });
          } else {
            // Load vitals from other forms to pre-populate
            const forms = patientData.forms || {};
            const preMed = forms.preMedical?.data || {};
            const postMed = forms.postMedical?.data || {};
            const eyeExam = forms.eyeExam?.data || {};

            setForm({
              ...initialAirportBohw,
              dateTop: new Date().toISOString().split("T")[0],
              name: patientData.name || "",
              fatherName: patientData.fatherName || "",
              sex: patientData.gender || "",
              mobileNo: patientData.mobile || "",
              residence: patientData.address || "",
              residingAt: patientData.address || "",
              dob: dobVal,
              aadharNo: patientData.aadharNo || (preMed.govtIdProof?.toLowerCase().includes("aadhar") ? preMed.govtIdProofNo : ""),
              ascertainedAge: String(patientData.age || ""),
              companyName: patientData.company || "Aster Medcare",
              height: String(preMed.height || postMed.height || ""),
              weight: String(preMed.weight || postMed.weight || ""),
              bloodPressure: preMed.bp || postMed.bp || "",
              pulse: String(preMed.pulse || postMed.pulse || ""),
              hearing: preMed.hearing || "Normal",
              refractiveError: eyeExam.refractiveError || "",
              colourVision: eyeExam.colourVision || "Normal",
              anyDisability: preMed.disability || "None",
              identificationMarks: preMed.identificationMark || "",
              fitStatus: postMed.fitStatus || "FIT"
            });
          }
        } catch (err) {
          console.error("Failed to load saved form:", err);
          setForm({
            ...initialAirportBohw,
            name: patientData.name || "",
            fatherName: patientData.fatherName || "",
            sex: patientData.gender || "",
            mobileNo: patientData.mobile || "",
            residence: patientData.address || "",
            residingAt: patientData.address || "",
            dob: dobVal,
            aadharNo: patientData.aadharNo || "",
            ascertainedAge: String(patientData.age || ""),
            companyName: patientData.company || "Aster Medcare",
            dateTop: new Date().toISOString().split("T")[0],
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
        await updatePatientForm(patientId, "4-form-airport-bohw", form);
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
      await updatePatientForm(patientId, "4-form-airport-bohw", form);
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
    navigate(`/patients/${patientId}/airport-bohw/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Form No. XI (Factory & BOCW)</span>
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
          <Section title="1. Patient Demographics & Vitals">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Father's Name" value={form.fatherName} onChange={(value) => updateField("fatherName", value)} />
            <Field label="Sex / Gender" value={form.sex} onChange={(value) => updateField("sex", value)} />
            <Field label="Date of Birth" type="date" value={form.dob} onChange={(value) => updateField("dob", value)} />
            <Field label="Ascertained Age (Years)" value={form.ascertainedAge} onChange={(value) => updateField("ascertainedAge", value)} />
            <Field label="Aadhar No" value={form.aadharNo} onChange={(value) => updateField("aadharNo", value)} />
            <Field label="Mobile No" value={form.mobileNo} onChange={(value) => updateField("mobileNo", value)} />
            <Field label="Company Name" value={form.companyName} onChange={(value) => updateField("companyName", value)} />
            <Field label="Height (cm)" value={form.height} onChange={(value) => updateField("height", value)} />
            <Field label="Weight (kg)" value={form.weight} onChange={(value) => updateField("weight", value)} />
            <Field label="Blood Pressure (mmHg)" value={form.bloodPressure} onChange={(value) => updateField("bloodPressure", value)} />
            <Field label="Pulse (/min)" value={form.pulse} onChange={(value) => updateField("pulse", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="Identification Marks" value={form.identificationMarks} onChange={(value) => updateField("identificationMarks", value)} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Permanent Residence Address" value={form.residence} onChange={(value) => updateField("residence", value)} />
            </div>
          </Section>

          <Section title="2. Medical Examinations & Functions">
            <Field label="Hearing" value={form.hearing} onChange={(value) => updateField("hearing", value)} />
            <Field label="Refractive Error" value={form.refractiveError} onChange={(value) => updateField("refractiveError", value)} />
            <Field label="Colour Vision" value={form.colourVision} onChange={(value) => updateField("colourVision", value)} />
            <Field label="Any Disability" value={form.anyDisability} onChange={(value) => updateField("anyDisability", value)} />
            <Field label="Arm function & Grip" value={form.armFunctionGrip} onChange={(value) => updateField("armFunctionGrip", value)} />
            <Field label="Leg & Foot function" value={form.legFootFunction} onChange={(value) => updateField("legFootFunction", value)} />
          </Section>

          <Section title="3. Illness History" cols={2}>
            {[
              ["varicose", "Varicose Veins"],
              ["seizure", "Seizure / Fits"],
              ["vertigo", "Vertigo / Giddiness"],
              ["acrophobia", "Acrophobia (Fear of Heights)"],
              ["diabetes", "Diabetes Mellitus"],
              ["stroke", "Stroke / Paralysis"],
              ["heartDiseases", "Heart Diseases"],
              ["majorIllnessOrSurgery", "Major Illness / Surgery"],
              ["symptomsVisible", "Symptoms Visible"],
              ["othersIfAny", "Others, if any"]
            ].map(([key, label]) => (
              <Choice key={key} label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
            ))}
          </Section>

          <Section title="4. Certification & Verdict">
            <Field label="Certificate Serial No" value={form.certificateSerialNo} onChange={(value) => updateField("certificateSerialNo", value)} />
            <Field label="Certificate Date" type="date" value={form.dateTop} onChange={(value) => updateField("dateTop", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="Residing At (Verified Address)" value={form.residingAt} onChange={(value) => updateField("residingAt", value)} />
            </div>
            <Field label="Fit for Employment In (Job type / Location)" value={form.fitForEmploymentIn} onChange={(value) => updateField("fitForEmploymentIn", value)} />
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">
                Worker Fitness Status
              </label>
              <select 
                className="input !py-2 text-xs font-semibold text-slate-700" 
                value={form.fitStatus} 
                onChange={(event) => updateField("fitStatus", event.target.value)}
              >
                <option value="FIT">FIT</option>
                <option value="UNFIT">UNFIT</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Reason for Refusal of Certificate (If any)" value={form.reasonRefusal} onChange={(value) => updateField("reasonRefusal", value)} />
            </div>
            <Field label="Reason for Certificate Revoked (If any)" value={form.reasonRevoked} onChange={(value) => updateField("reasonRevoked", value)} />
          </Section>
        </div>
      </form>
    </AppShell>
  );
}

function Section({ title, children, cols = 4 }) {
  const gridClass = cols === 2
    ? "grid grid-cols-1 md:grid-cols-2 gap-5"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5";
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5 animate-fade-in">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>
      <div className={gridClass}>{children}</div>
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

function Choice({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition h-12">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
        <button
          type="button"
          onClick={() => onChange("YES")}
          className={`w-14 py-1 text-xxs font-extrabold rounded-md transition-all ${
            value === "YES"
              ? "bg-brand text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          YES
        </button>
        <button
          type="button"
          onClick={() => onChange("NO")}
          className={`w-14 py-1 text-xxs font-extrabold rounded-md transition-all ${
            value === "NO"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          NO
        </button>
      </div>
    </div>
  );
}
