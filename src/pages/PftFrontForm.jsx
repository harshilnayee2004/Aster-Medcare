import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const initialPftFrontForm = {
  dataCollectedBy: "",
  formNo: "",
  date: "",
  patientName: "",
  age: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  mobileNo: "",
  company: "",
  occupationPost: "",
  allergicHistory: "No Allergy",
  allergicDetails: "",
  
  // Test Required
  testPre: false,
  testPost: false,
  testLungVolume: false,
  testCardio: false,
  testBronchial: false,
  
  // Questionnaire
  diagnosis: "Asthma",
  diagnosisDetails: "",
  dailyCough: "No",
  
  // Medical History
  histAsthma: false,
  histEmphysema: false,
  histPneumonia: false,
  histAngina: false,
  histHeartDisease: false,
  histWheezing: false,
  histTuberculosis: false,
  histBronchiectasis: false,
  histBronchitis: false,
  
  // Shortness of breath
  sob: "No",
  sobType: "Sitting",
  
  xrayFindings: "",
  sleepApnea: "No",
  reasonForTest: "",
  
  surgery: "No",
  surgeryDetails: "",
  
  radChemo: "No",
  radMedication: "",
  radArea: "",
  
  exposure: "No",
  exposureDetails: "",
  
  prevTest: "No",
  prevTestDetails: "",
  
  // Clinical Information
  clinDyspnea: false,
  clinHeartFailure: false,
  clinCyanosis: false,
  clinAngina: false,
  clinOther: false,
  clinOtherDetails: "",
  
  // Current Treatment
  treatBronchodilators: false,
  treatSteroids: false,
  treatBetaBlockers: false,
  treatAntihypertensive: false,
  treatOther: false,
  treatOtherDetails: "",
  
  // Smoking History
  everSmoked: "No",
  smokeType: "Cigarettes",
  smokeDuration: "",
  smokePacksPerDay: "",
  smokeQuitDate: "",
  
  contraBronchodilator: "No",
  contraDetails: "",
  
  recentEcg: "Not Done",
  ecgDate: "",
  
  familyHistoryPet: "No",
  familyPetName: "",
  familySince: "",
  
  doctorName: "",
  doctorDate: "",
};

export default function PftFrontForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/13-form-pft-front`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialPftFrontForm,
              ...res.data.form.data,
              dataCollectedBy: res.data.form.data.dataCollectedBy || currentUser?.name || ""
            });
          } else {
            // Auto populate from patient info
            setForm({
              ...initialPftFrontForm,
              patientName: patientData.name || "",
              age: patientData.age ? String(patientData.age) : "",
              gender: patientData.gender || "Male",
              address: patientData.address || "",
              city: patientData.city || "",
              state: patientData.state || "",
              pinCode: patientData.pinCode || "",
              mobileNo: patientData.mobile || "",
              company: patientData.company || "",
              occupationPost: patientData.occupation || "",
              date: new Date().toISOString().split("T")[0],
              doctorDate: new Date().toISOString().split("T")[0],
              dataCollectedBy: currentUser?.name || ""
            });
          }
        } catch {
          setForm({
            ...initialPftFrontForm,
            patientName: patientData.name || "",
            age: patientData.age ? String(patientData.age) : "",
            gender: patientData.gender || "Male",
            address: patientData.address || "",
            city: patientData.city || "",
            state: patientData.state || "",
            pinCode: patientData.pinCode || "",
            mobileNo: patientData.mobile || "",
            company: patientData.company || "",
            occupationPost: patientData.occupation || "",
            date: new Date().toISOString().split("T")[0],
            doctorDate: new Date().toISOString().split("T")[0],
            dataCollectedBy: currentUser?.name || ""
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
        await updatePatientForm(patientId, "13-form-pft-front", form);
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
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function save() {
    setSaveStatus("Saving...");
    try {
      await updatePatientForm(patientId, "13-form-pft-front", form);
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
    navigate(`/patients/${patientId}/pft-front/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">PFT Test Form (Front)</span>
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
          {/* Section 1: Basic Information */}
          <Section title="1. Basic Information">
            <Field label="Data Collected By" value={form.dataCollectedBy} onChange={(v) => updateField("dataCollectedBy", v)} required />
            <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
              <Field label="Form Number" value={form.formNo} onChange={(v) => updateField("formNo", v)} />
              <Field label="Date" type="date" value={form.date} onChange={(v) => updateField("date", v)} required />
            </div>
          </Section>

          {/* Section 2: Patient Details */}
          <Section title="2. Patient Details">
            <Field label="Patient Name" value={form.patientName} onChange={(v) => updateField("patientName", v)} required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" type="number" value={form.age} onChange={(v) => updateField("age", v)} required />
              <div>
                <label className="field-label font-bold text-slate-600 mb-2">Gender</label>
                <select className="select text-xs font-semibold text-slate-700" value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Section 3: Address Details */}
          <Section title="3. Address Details">
            <div className="col-span-1 md:col-span-2">
              <Field label="Address" value={form.address} onChange={(v) => updateField("address", v)} />
            </div>
            <div className="grid grid-cols-3 gap-4 col-span-1 md:col-span-2">
              <Field label="City" value={form.city} onChange={(v) => updateField("city", v)} />
              <Field label="State" value={form.state} onChange={(v) => updateField("state", v)} />
              <Field label="PIN Code" value={form.pinCode} onChange={(v) => updateField("pinCode", v)} />
            </div>
            <Field label="Mobile Number" value={form.mobileNo} onChange={(v) => updateField("mobileNo", v)} />
          </Section>

          {/* Section 4: Employment Details */}
          <Section title="4. Employment Details">
            <Field label="Company" value={form.company} onChange={(v) => updateField("company", v)} />
            <Field label="Occupation Post" value={form.occupationPost} onChange={(v) => updateField("occupationPost", v)} />
          </Section>

          {/* Section 5: Medical History */}
          <Section title="5. Allergic History">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Allergic History</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.allergicHistory} onChange={(e) => updateField("allergicHistory", e.target.value)}>
                <option value="No Allergy">No Allergy</option>
                <option value="Allergy Present">Allergy Present</option>
              </select>
            </div>
            {form.allergicHistory === "Allergy Present" && (
              <Field label="Allergy Details" value={form.allergicDetails} onChange={(v) => updateField("allergicDetails", v)} />
            )}
          </Section>

          {/* Section 6: Test Required */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">6. Test Required</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox label="Pre Bronchodilator" checked={form.testPre} onChange={(v) => updateField("testPre", v)} />
              <Checkbox label="Post Bronchodilator" checked={form.testPost} onChange={(v) => updateField("testPost", v)} />
              <Checkbox label="Lung Volume" checked={form.testLungVolume} onChange={(v) => updateField("testLungVolume", v)} />
              <Checkbox label="Cardio-Pulmonary Exercise" checked={form.testCardio} onChange={(v) => updateField("testCardio", v)} />
              <Checkbox label="Bronchial Provocation" checked={form.testBronchial} onChange={(v) => updateField("testBronchial", v)} />
            </div>
          </div>

          {/* Section 7: Questionnaire */}
          <Section title="7. Clinical Questionnaire">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Clinical Diagnosis</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)}>
                <option value="COPD">COPD</option>
                <option value="Asthma">Asthma</option>
                <option value="Bronchitis">Bronchitis</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {form.diagnosis === "Other" && (
              <Field label="Diagnosis Details" value={form.diagnosisDetails} onChange={(v) => updateField("diagnosisDetails", v)} />
            )}
            
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="field-label font-bold text-slate-600 mb-2">Daily Cough?</label>
                <select className="select text-xs font-semibold text-slate-700" value={form.dailyCough} onChange={(e) => updateField("dailyCough", e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="field-label font-bold text-slate-600 mb-2">Sleep Apnea?</label>
                <select className="select text-xs font-semibold text-slate-700" value={form.sleepApnea} onChange={(e) => updateField("sleepApnea", e.target.value)}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Field label="X-Ray Findings (Old)" value={form.xrayFindings} onChange={(v) => updateField("xrayFindings", v)} />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Field label="Reason for Test" value={form.reasonForTest} onChange={(v) => updateField("reasonForTest", v)} />
            </div>
          </Section>

          {/* Medical History Conditions Checklist */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">Medical History Conditions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox label="Asthma" checked={form.histAsthma} onChange={(v) => updateField("histAsthma", v)} />
              <Checkbox label="Emphysema" checked={form.histEmphysema} onChange={(v) => updateField("histEmphysema", v)} />
              <Checkbox label="Pneumonia" checked={form.histPneumonia} onChange={(v) => updateField("histPneumonia", v)} />
              <Checkbox label="Angina" checked={form.histAngina} onChange={(v) => updateField("histAngina", v)} />
              <Checkbox label="Heart Disease" checked={form.histHeartDisease} onChange={(v) => updateField("histHeartDisease", v)} />
              <Checkbox label="Wheezing" checked={form.histWheezing} onChange={(v) => updateField("histWheezing", v)} />
              <Checkbox label="Tuberculosis" checked={form.histTuberculosis} onChange={(v) => updateField("histTuberculosis", v)} />
              <Checkbox label="Bronchiectasis" checked={form.histBronchiectasis} onChange={(v) => updateField("histBronchiectasis", v)} />
              <Checkbox label="Bronchitis" checked={form.histBronchitis} onChange={(v) => updateField("histBronchitis", v)} />
            </div>
          </div>

          {/* Shortness of Breath */}
          <Section title="Shortness of Breath">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Shortness of Breath?</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.sob} onChange={(e) => updateField("sob", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.sob === "Yes" && (
              <div>
                <label className="field-label font-bold text-slate-600 mb-2">If Yes, under what conditions?</label>
                <select className="select text-xs font-semibold text-slate-700" value={form.sobType} onChange={(e) => updateField("sobType", e.target.value)}>
                  <option value="Sitting">Sitting</option>
                  <option value="Walking">Walking</option>
                  <option value="Climbing Stairs">Climbing Stairs</option>
                </select>
              </div>
            )}
          </Section>

          {/* Surgery, Chemotherapy, Exposure, Previous Tests */}
          <Section title="Recent Surgeries & Exposure Details">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Recent Chest/Abdomen Surgery?</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.surgery} onChange={(e) => updateField("surgery", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.surgery === "Yes" && (
              <Field label="Surgery Details" value={form.surgeryDetails} onChange={(v) => updateField("surgeryDetails", v)} />
            )}

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-5">
              <label className="field-label font-bold text-slate-600 mb-2">Radiation / Chemotherapy?</label>
              <select className="select text-xs font-semibold text-slate-700 mb-3" value={form.radChemo} onChange={(e) => updateField("radChemo", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {form.radChemo === "Yes" && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Medication" value={form.radMedication} onChange={(v) => updateField("radMedication", v)} />
                  <Field label="Radiation Area" value={form.radArea} onChange={(v) => updateField("radArea", v)} />
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-5">
              <label className="field-label font-bold text-slate-600 mb-2">Dust / Fumes / Chemical Exposure?</label>
              <select className="select text-xs font-semibold text-slate-700 mb-3" value={form.exposure} onChange={(e) => updateField("exposure", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {form.exposure === "Yes" && (
                <Field label="Exposure Details" value={form.exposureDetails} onChange={(v) => updateField("exposureDetails", v)} />
              )}
            </div>

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-5">
              <label className="field-label font-bold text-slate-600 mb-2">Previous PFT Test?</label>
              <select className="select text-xs font-semibold text-slate-700 mb-3" value={form.prevTest} onChange={(e) => updateField("prevTest", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {form.prevTest === "Yes" && (
                <Field label="Hospital/Clinic & Details" value={form.prevTestDetails} onChange={(v) => updateField("prevTestDetails", v)} />
              )}
            </div>
          </Section>

          {/* Clinical Information Checklist */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">Clinical Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <Checkbox label="Dyspnea" checked={form.clinDyspnea} onChange={(v) => updateField("clinDyspnea", v)} />
              <Checkbox label="Heart Failure" checked={form.clinHeartFailure} onChange={(v) => updateField("clinHeartFailure", v)} />
              <Checkbox label="Cyanosis" checked={form.clinCyanosis} onChange={(v) => updateField("clinCyanosis", v)} />
              <Checkbox label="Angina" checked={form.clinAngina} onChange={(v) => updateField("clinAngina", v)} />
              <Checkbox label="Other" checked={form.clinOther} onChange={(v) => updateField("clinOther", v)} />
            </div>
            {form.clinOther && (
              <Field label="Clinical Notes (Other Details)" value={form.clinOtherDetails} onChange={(v) => updateField("clinOtherDetails", v)} />
            )}
          </div>

          {/* Current Treatment Checklist */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 tracking-tight pb-3 border-b border-slate-100">Current Treatment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <Checkbox label="Bronchodilators" checked={form.treatBronchodilators} onChange={(v) => updateField("treatBronchodilators", v)} />
              <Checkbox label="Steroids" checked={form.treatSteroids} onChange={(v) => updateField("treatSteroids", v)} />
              <Checkbox label="Beta Blockers" checked={form.treatBetaBlockers} onChange={(v) => updateField("treatBetaBlockers", v)} />
              <Checkbox label="Antihypertensive Agents" checked={form.treatAntihypertensive} onChange={(v) => updateField("treatAntihypertensive", v)} />
              <Checkbox label="Other" checked={form.treatOther} onChange={(v) => updateField("treatOther", v)} />
            </div>
            {form.treatOther && (
              <Field label="Treatment Details" value={form.treatOtherDetails} onChange={(v) => updateField("treatOtherDetails", v)} />
            )}
          </div>

          {/* Smoking History */}
          <Section title="Smoking History">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Have you ever smoked?</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.everSmoked} onChange={(e) => updateField("everSmoked", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.everSmoked === "Yes" && (
              <>
                <div>
                  <label className="field-label font-bold text-slate-600 mb-2">Type of Smoking</label>
                  <select className="select text-xs font-semibold text-slate-700" value={form.smokeType} onChange={(e) => updateField("smokeType", e.target.value)}>
                    <option value="Cigarettes">Cigarettes</option>
                    <option value="Bidi">Bidi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Field label="Smoking Duration (Years)" value={form.smokeDuration} onChange={(v) => updateField("smokeDuration", v)} />
                <Field label="Packs / Amount Per Day" value={form.smokePacksPerDay} onChange={(v) => updateField("smokePacksPerDay", v)} />
                <Field label="Quit Date / Details" value={form.smokeQuitDate} onChange={(v) => updateField("smokeQuitDate", v)} />
              </>
            )}
          </Section>

          {/* Contraindications & ECG */}
          <Section title="Contraindications & ECG">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Contraindication to Bronchodilator?</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.contraBronchodilator} onChange={(e) => updateField("contraBronchodilator", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.contraBronchodilator === "Yes" && (
              <Field label="Details" value={form.contraDetails} onChange={(v) => updateField("contraDetails", v)} />
            )}

            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-5">
              <label className="field-label font-bold text-slate-600 mb-2">Most Recent ECG</label>
              <select className="select text-xs font-semibold text-slate-700 mb-3" value={form.recentEcg} onChange={(e) => updateField("recentEcg", e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Not Done">Not Done</option>
              </select>
              {form.recentEcg !== "Not Done" && (
                <Field label="ECG Date" type="date" value={form.ecgDate} onChange={(v) => updateField("ecgDate", v)} />
              )}
            </div>
          </Section>

          {/* Family History */}
          <Section title="Family History of PET">
            <div>
              <label className="field-label font-bold text-slate-600 mb-2">Family History of PET?</label>
              <select className="select text-xs font-semibold text-slate-700" value={form.familyHistoryPet} onChange={(e) => updateField("familyHistoryPet", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {form.familyHistoryPet === "Yes" && (
              <>
                <Field label="PET Member Name" value={form.familyPetName} onChange={(v) => updateField("familyPetName", v)} />
                <Field label="Since (Year/Date)" value={form.familySince} onChange={(v) => updateField("familySince", v)} />
              </>
            )}
          </Section>

          {/* Doctor Section */}
          <Section title="Doctor Section">
            <Field label="Doctor Name" value={form.doctorName} onChange={(v) => updateField("doctorName", v)} />
            <Field label="Signature Date" type="date" value={form.doctorDate} onChange={(v) => updateField("doctorDate", v)} />
          </Section>
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
    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
      <input 
        type="checkbox" 
        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" 
        checked={checked || false} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </label>
  );
}
