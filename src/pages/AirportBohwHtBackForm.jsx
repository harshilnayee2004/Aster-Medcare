import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialAirportBohwHtBack = {
  certificateSerialNo: "",
  name: "",
  age: "",
  sex: "",
  date: "",
  mobileNo: "",
  companyName: "",
  idNo: "",
  previousHistory: "",
  beforePulseRate: "",
  beforeBp: "",
  afterPulseRate: "",
  afterBp: "",
  uncontrolledThoughts: "NO",
  uncontrolledThoughtsRemark: "",
  fearLosingControl: "NO",
  fearLosingControlRemark: "",
  fearFainting: "NO",
  fearFaintingRemark: "",
  intenseFeelingComeDown: "NO",
  intenseFeelingComeDownRemark: "",
  worryUpcomingEvents: "NO",
  worryUpcomingEventsRemark: "",
  palpitation: "NO",
  palpitationRemark: "",
  dizziness: "NO",
  dizzinessRemark: "",
  chestPain: "NO",
  chestPainRemark: "",
  shivering: "NO",
  shiveringRemark: "",
  feelingChoking: "NO",
  feelingChokingRemark: "",
  sweating: "NO",
  sweatingRemark: "",
  nausea: "NO",
  nauseaRemark: "",
  numbnessTugging: "NO",
  numbnessTuggingRemark: "",
  flushes: "NO",
  flushesRemark: "",
  flatFoot: "NO",
  flatFootRemark: "",
  fitStatus: "FIT",
  remark: "",
  criteriaMajorIllness: "NO",
  criteriaMajorIllnessRemark: "",
  criteriaEpilepsy: "NO",
  criteriaEpilepsyRemark: "",
  criteriaVision: "NO",
  criteriaVisionRemark: "",
  criteriaAuditory: "NO",
  criteriaAuditoryRemark: "",
  criteriaLocomotor: "NO",
  criteriaLocomotorRemark: "",
  criteriaBreathing: "YES",
  criteriaBreathingRemark: "",
  criteriaUpperLimbs: "YES",
  criteriaUpperLimbsRemark: "",
  criteriaLowerLimbs: "YES",
  criteriaLowerLimbsRemark: "",
  criteriaStability: "YES",
  criteriaStabilityRemark: "",
  criteriaAnyOtherText: "",
  criteriaAnyOther: "NO",
  criteriaAnyOtherRemark: "",
  certifiedName: "",
  fitWorkAt: "",
  doctorName: "",
  doctorRegistration: ""
};

export default function AirportBohwHtBackForm() {
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
        
        const today = new Date().toISOString().split("T")[0];

        try {
          const res = await api.get(`/patients/${patientId}/forms/36-form-airport-bohw-ht-back`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialAirportBohwHtBack,
              name: patientData.name || "",
              age: patientData.age || "",
              sex: patientData.gender || "",
              mobileNo: patientData.mobile || "",
              companyName: patientData.company || "Aster Medcare",
              idNo: patientData.patientId || "",
              certifiedName: patientData.name || "",
              date: today,
              ...res.data.form.data
            });
          } else {
            // Load vitals from other forms to pre-populate
            const forms = patientData.forms || {};
            const preMed = forms.preMedical?.data || {};
            const postMed = forms.postMedical?.data || {};

            setForm({
              ...initialAirportBohwHtBack,
              name: patientData.name || "",
              age: patientData.age || "",
              sex: patientData.gender || "",
              mobileNo: patientData.mobile || "",
              companyName: patientData.company || "Aster Medcare",
              idNo: patientData.patientId || "",
              certifiedName: patientData.name || "",
              date: today,
              beforePulseRate: String(preMed.pulse || postMed.pulse || ""),
              beforeBp: preMed.bp || postMed.bp || "",
              previousHistory: preMed.disability || "None"
            });
          }
        } catch (err) {
          console.error("Failed to load saved form:", err);
          setForm({
            ...initialAirportBohwHtBack,
            name: patientData.name || "",
            age: patientData.age || "",
            sex: patientData.gender || "",
            mobileNo: patientData.mobile || "",
            companyName: patientData.company || "Aster Medcare",
            idNo: patientData.patientId || "",
            certifiedName: patientData.name || "",
            date: today,
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
        await updatePatientForm(patientId, "36-form-airport-bohw-ht-back", form);
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
      await updatePatientForm(patientId, "36-form-airport-bohw-ht-back", form);
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
    navigate(`/patients/${patientId}/airport-bohw-ht-back/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Airport BOHW-HT Back</span>
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
          <Section title="1. Candidate Demographics & Vitals">
            <Field label="Full Name" value={form.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Age" value={form.age} onChange={(value) => updateField("age", value)} required />
            <Field label="Sex / Gender" value={form.sex} onChange={(value) => updateField("sex", value)} />
            <Field label="Test Date" type="date" value={form.date} onChange={(value) => updateField("date", value)} />
            <Field label="Mobile No" value={form.mobileNo} onChange={(value) => updateField("mobileNo", value)} />
            <Field label="Company Name" value={form.companyName} onChange={(value) => updateField("companyName", value)} />
            <Field label="ID No" value={form.idNo} onChange={(value) => updateField("idNo", value)} />
            <div className="col-span-1 md:col-span-2">
              <Field label="Previous Health History" value={form.previousHistory} onChange={(value) => updateField("previousHistory", value)} />
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-100 pt-4 mt-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <span className="field-label font-bold text-slate-700 block border-b border-slate-200/55 pb-1.5">Before Height Pass</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pulse Rate (/Min)" value={form.beforePulseRate} onChange={(value) => updateField("beforePulseRate", value)} />
                  <Field label="Blood Pressure (mmHg)" value={form.beforeBp} onChange={(value) => updateField("beforeBp", value)} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <span className="field-label font-bold text-slate-700 block border-b border-slate-200/55 pb-1.5">After Height Pass</span>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pulse Rate (/Min)" value={form.afterPulseRate} onChange={(value) => updateField("afterPulseRate", value)} />
                  <Field label="Blood Pressure (mmHg)" value={form.afterBp} onChange={(value) => updateField("afterBp", value)} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="2. Mental & Emotional Fitness">
            {[
              ["uncontrolledThoughts", "a) Un Controlled thoughts", "uncontrolledThoughtsRemark"],
              ["fearLosingControl", "b) Fear of losing control", "fearLosingControlRemark"],
              ["fearFainting", "c) Fear of Fainting", "fearFaintingRemark"],
              ["intenseFeelingComeDown", "a) Intense feeling to come down", "intenseFeelingComeDownRemark"],
              ["worryUpcomingEvents", "b) Worrying about upcoming events", "worryUpcomingEventsRemark"]
            ].map(([key, label, remarkKey]) => (
              <div key={key} className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b border-slate-100/50 pb-3 last:border-0 last:pb-0">
                <div className="md:col-span-2">
                  <Choice label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
                </div>
                <div className="md:col-span-2">
                  <Field label="Remark (Optional)" value={form[remarkKey]} onChange={(value) => updateField(remarkKey, value)} />
                </div>
              </div>
            ))}
          </Section>

          <Section title="3. Physical Fitness Signs">
            {[
              ["palpitation", "a) Palpitation", "palpitationRemark"],
              ["dizziness", "b) Dizziness", "dizzinessRemark"],
              ["chestPain", "c) Chest pain", "chestPainRemark"],
              ["shivering", "d) Shaking / Shivering", "shiveringRemark"],
              ["feelingChoking", "e) Feeling of Choking", "feelingChokingRemark"],
              ["sweating", "f) Sweating", "sweatingRemark"],
              ["nausea", "g) Nausea", "nauseaRemark"],
              ["numbnessTugging", "h) Numbness and Tugging", "numbnessTuggingRemark"],
              ["flushes", "i) Cold / Hot flushes", "flushesRemark"],
              ["flatFoot", "j) Flat Foot", "flatFootRemark"]
            ].map(([key, label, remarkKey]) => (
              <div key={key} className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b border-slate-100/50 pb-3 last:border-0 last:pb-0">
                <div className="md:col-span-2">
                  <Choice label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
                </div>
                <div className="md:col-span-2">
                  <Field label="Remark (Optional)" value={form[remarkKey]} onChange={(value) => updateField(remarkKey, value)} />
                </div>
              </div>
            ))}
          </Section>

          <Section title="4. Medical Examination Test Criteria">
            {[
              ["criteriaMajorIllness", "1. Major Medical / Surgical illness history", "criteriaMajorIllnessRemark"],
              ["criteriaEpilepsy", "2. Any case of epileptic disorder", "criteriaEpilepsyRemark"],
              ["criteriaVision", "3. Visual impairment or Colour blindness", "criteriaVisionRemark"],
              ["criteriaAuditory", "4. Suffering from any auditory defect", "criteriaAuditoryRemark"],
              ["criteriaLocomotor", "5. Locomotor disability or Spinal deformity", "criteriaLocomotorRemark"],
              ["criteriaBreathing", "6. Breathing peak & average flow rate is OK", "criteriaBreathingRemark"],
              ["criteriaUpperLimbs", "7. Upper Limbs - Adequate arm function & grip", "criteriaUpperLimbsRemark"],
              ["criteriaLowerLimbs", "8. Lower Limbs - Adequate leg & foot protection", "criteriaLowerLimbsRemark"],
              ["criteriaStability", "9. General - Mental alertness & eye-hand-foot stability", "criteriaStabilityRemark"]
            ].map(([key, label, remarkKey]) => (
              <div key={key} className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b border-slate-100/50 pb-3 last:border-0 last:pb-0">
                <div className="md:col-span-2">
                  <Choice label={label} value={form[key]} onChange={(value) => updateField(key, value)} />
                </div>
                <div className="md:col-span-2">
                  <Field label="Remark (Optional)" value={form[remarkKey]} onChange={(value) => updateField(remarkKey, value)} />
                </div>
              </div>
            ))}
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Field label="10. Any other point (Text)" value={form.criteriaAnyOtherText} onChange={(value) => updateField("criteriaAnyOtherText", value)} placeholder="Enter details..." />
              </div>
              <div>
                <Choice label="Status" value={form.criteriaAnyOther} onChange={(value) => updateField("criteriaAnyOther", value)} />
              </div>
              <div>
                <Field label="Remark (Optional)" value={form.criteriaAnyOtherRemark} onChange={(value) => updateField("criteriaAnyOtherRemark", value)} />
              </div>
            </div>
          </Section>

          <Section title="5. Certification Verdict & Signatures">
            <div className="col-span-1 md:col-span-2">
              <Field label="This is to certify that I have examined Mr." value={form.certifiedName} onChange={(value) => updateField("certifiedName", value)} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Field label="Fit for work for Height At (Location / Height)" value={form.fitWorkAt} onChange={(value) => updateField("fitWorkAt", value)} />
            </div>
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">
                Fit / Unfit status
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
            <div className="col-span-1 md:col-span-3">
              <Field label="Remark If Any" value={form.remark} onChange={(value) => updateField("remark", value)} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-4 mt-2">
              <Field label="Doctor Name" value={form.doctorName} onChange={(value) => updateField("doctorName", value)} />
              <Field label="Doctor Registration/Stamp" value={form.doctorRegistration} onChange={(value) => updateField("doctorRegistration", value)} />
              <div className="rounded-xl border border-slate-100 bg-slate-50/55 p-3 flex flex-col justify-center text-center">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Patient Signature Status</span>
                <span className={`text-xs font-bold mt-1 ${patient.signature ? "text-green-600" : "text-amber-500"}`}>
                  {patient.signature ? "Signature Captured ✓" : "No Signature Captured ✗"}
                </span>
              </div>
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
        <option value="YES">YES</option>
        <option value="NO">NO</option>
      </select>
    </div>
  );
}
