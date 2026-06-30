import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialVaccineCertificate = {
  hz_day1: "",
  hz_day28: "",
  ty_day1: "",
  ty_day730: "",
  hep_day1: "",
  hep_day30: "",
  hep_day180: "",
  flu_day1: "",
  pneu_day1: "",
  men_day1: "",
  tet_day1: "",
  cov_day1: "",
  cov_day30: "",
  cov_day90: "",
};

export default function VaccineCertificateForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/18-form-vaccine-ircs-forms-2`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialVaccineCertificate,
              ...res.data.form.data
            });
          } else {
            setForm({
              ...initialVaccineCertificate,
            });
          }
        } catch {
          setForm({
            ...initialVaccineCertificate,
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
        await updatePatientForm(patientId, "18-form-vaccine-ircs-forms-2", form);
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

  function addDays(dateStr, days) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "hz_day1") {
        next.hz_day28 = addDays(value, 28);
      } else if (field === "ty_day1") {
        next.ty_day730 = addDays(value, 730);
      } else if (field === "hep_day1") {
        next.hep_day30 = addDays(value, 30);
        next.hep_day180 = addDays(value, 180);
      } else if (field === "cov_day1") {
        next.cov_day30 = addDays(value, 30);
        next.cov_day90 = addDays(value, 90);
      }
      return next;
    });
  }

  async function save() {
    setSaveStatus("Saving...");
    try {
      await updatePatientForm(patientId, "18-form-vaccine-ircs-forms-2", form);
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
    navigate(`/patients/${patientId}/vaccine-certificate/preview`);
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
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Vaccination Certificate</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VaccineSection title="Herpes Zoster / Varicella (VARILRIX)">
            <Field label="Day-1 Dose" type="date" value={form.hz_day1} onChange={(val) => updateField("hz_day1", val)} />
            <Field label="Day-28 Dose" type="date" value={form.hz_day28} onChange={(val) => updateField("hz_day28", val)} />
          </VaccineSection>

          <VaccineSection title="Typhoid Vaccine (TYPBAR TCV)">
            <Field label="Day-1 Dose" type="date" value={form.ty_day1} onChange={(val) => updateField("ty_day1", val)} />
            <Field label="Day-730 Dose" type="date" value={form.ty_day730} onChange={(val) => updateField("ty_day730", val)} />
          </VaccineSection>

          <VaccineSection title="Hepatitis Vaccine (TWINRIX)">
            <Field label="Day-1 Dose" type="date" value={form.hep_day1} onChange={(val) => updateField("hep_day1", val)} />
            <Field label="Day-30 Dose" type="date" value={form.hep_day30} onChange={(val) => updateField("hep_day30", val)} />
            <Field label="Day-180 Dose" type="date" value={form.hep_day180} onChange={(val) => updateField("hep_day180", val)} />
          </VaccineSection>

          <VaccineSection title="Influenza Vaccine (INFLUVAC / FLURIX)">
            <Field label="Day-1 Dose" type="date" value={form.flu_day1} onChange={(val) => updateField("flu_day1", val)} />
          </VaccineSection>

          <VaccineSection title="Pneumonia Vaccine (PNEUMOVAX23 / PREVENAR 23)">
            <Field label="Day-1 Dose" type="date" value={form.pneu_day1} onChange={(val) => updateField("pneu_day1", val)} />
          </VaccineSection>

          <VaccineSection title="Meningococcal Vaccine">
            <Field label="Day-1 Dose" type="date" value={form.men_day1} onChange={(val) => updateField("men_day1", val)} />
          </VaccineSection>

          <VaccineSection title="Tetanus Vaccine (TETATOX)">
            <Field label="Day-1 Dose" type="date" value={form.tet_day1} onChange={(val) => updateField("tet_day1", val)} />
          </VaccineSection>

          <VaccineSection title="Covid-19 Vaccine (COVISHIELD / COVAXIN)">
            <Field label="Day-1 Dose" type="date" value={form.cov_day1} onChange={(val) => updateField("cov_day1", val)} />
            <Field label="Day-30 Dose" type="date" value={form.cov_day30} onChange={(val) => updateField("cov_day30", val)} />
            <Field label="Day-90 Dose" type="date" value={form.cov_day90} onChange={(val) => updateField("cov_day90", val)} />
          </VaccineSection>
        </div>
      </form>
    </AppShell>
  );
}

function VaccineSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 animate-fade-in">
      <h3 className="text-sm font-bold text-slate-800 tracking-tight pb-2 border-b border-slate-50">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="field-label font-bold text-slate-600 mb-1.5">
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
