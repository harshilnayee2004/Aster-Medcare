import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
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
      <form onSubmit={submit} className="mx-auto max-w-4xl rounded-lg border border-line bg-white p-8 shadow-soft">
        <div className="mb-8 flex items-center justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">X-Ray Report</h1>
            <p className="mt-2 text-muted">Upload patient chest X-Ray or medical scans · {patient.name} · {patient.patientId}</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              saveStatus === "Saved ✓" ? "bg-green-50 text-green-700 border border-green-200" :
              saveStatus === "Saving..." ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" :
              "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {saveStatus}
            </span>
            <button type="button" onClick={preview} className="button-secondary" disabled={!form.photo}>Preview Report</button>
            <button type="submit" className="button-primary">Save Report</button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="field-label">X-Ray Image File</label>
            {!form.photo ? (
              <div className="flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 transition hover:border-brand">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="mt-4 flex text-sm text-slate-600">
                    <label htmlFor="xray-file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-brand focus-within:outline-none hover:text-blue-700">
                      <span>Upload a file</span>
                      <input id="xray-file-upload" name="xray-file-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => handlePhoto(e.target.files[0])} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg border border-line bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-700">Uploaded X-Ray Preview:</span>
                  <button type="button" onClick={removePhoto} className="text-sm font-medium text-red-600 hover:text-red-800">
                    Remove Image
                  </button>
                </div>
                <div className="flex justify-center bg-black rounded-lg p-4 max-h-[500px] overflow-hidden">
                  <img src={form.photo} alt="X-Ray Preview" className="max-h-[460px] max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppShell>
  );
}
