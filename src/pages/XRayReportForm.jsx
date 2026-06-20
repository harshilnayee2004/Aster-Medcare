import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

export default function XRayReportForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/xrayReport`);
          if (res.data && res.data.formExists) {
            setForm({
              photo: "",
              ...res.data.form.data
            });
          } else {
            setForm({ photo: "" });
          }
        } catch {
          setForm({ photo: "" });
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
        await updatePatientForm(patientId, "xrayReport", form);
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

  function handlePhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaveStatus("Saving...");
    try {
      await updatePatientForm(patientId, "xrayReport", form);
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
    navigate(`/patients/${patientId}/xray-report/preview`);
  }

  function removePhoto() {
    setForm({ photo: "" });
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb link */}
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">X-Ray Report</span>
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
            <button type="button" onClick={preview} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm" disabled={!form.photo}>Preview Report</button>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm">Save Report</button>
          </div>
        </div>

        {/* Form Body Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">X-Ray Chest Scan Upload</h2>
            <p className="text-xxs text-slate-400 mt-0.5">Please upload an image file of the worker's chest X-Ray.</p>
          </div>
          
          <div>
            <label className="field-label font-bold text-slate-600 mb-2">X-Ray Image File</label>
            {!form.photo ? (
              <div className="flex justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 transition hover:border-brand bg-slate-50/50">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="mt-4 flex text-sm text-slate-600 justify-center">
                    <label htmlFor="xray-file-upload" className="relative cursor-pointer rounded-md font-bold text-brand focus-within:outline-none hover:text-blue-700">
                      <span>Upload a file</span>
                      <input id="xray-file-upload" name="xray-file-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => handlePhoto(e.target.files[0])} />
                    </label>
                    <p className="pl-1 text-slate-400 font-medium">or drag and drop</p>
                  </div>
                  <p className="text-xxs text-slate-400 mt-2 font-medium">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500">Uploaded X-Ray Preview:</span>
                  <button type="button" onClick={removePhoto} className="text-xs font-bold text-red-600 hover:text-red-800 transition">
                    Remove Image
                  </button>
                </div>
                <div className="flex justify-center bg-slate-900 rounded-xl p-4 max-h-[500px] overflow-hidden">
                  <img src={form.photo} alt="X-Ray Preview" className="max-h-[460px] max-w-full object-contain shadow-md rounded" />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppShell>
  );
}
