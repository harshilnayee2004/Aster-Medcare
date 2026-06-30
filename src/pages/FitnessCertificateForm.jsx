import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";

const initialFitnessForm = {
  name: "",
  parentName: "",
  age: "",
  residentOfLine1: "",
  residentOfLine2: "",
  residentOfLine3: "",
  marksOfIdentification: "",
  signatureCandidate: "",
  leftThumb: "",
  signatureMedicalOfficer: "",
  nameMedicalOfficer: "",
  registrationNo: "",
  date: "",
  seal: "",
};

export default function FitnessCertificateForm() {
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
          const res = await api.get(`/patients/${patientId}/forms/25-form-for-medical-fitness-certificate-format`);
          if (res.data && res.data.formExists) {
            setForm({
              ...initialFitnessForm,
              ...res.data.form.data
            });
          } else {
            // Auto populate from patient info
            setForm({
              ...initialFitnessForm,
              name: patientData.name || "",
              age: patientData.age ? String(patientData.age) : "",
              parentName: patientData.fatherName || "",
              residentOfLine1: patientData.address || "",
              signatureCandidate: patientData.signature || "",
              date: new Date().toISOString().split("T")[0],
            });
          }
        } catch {
          setForm({
            ...initialFitnessForm,
            name: patientData.name || "",
            age: patientData.age ? String(patientData.age) : "",
            parentName: patientData.fatherName || "",
            residentOfLine1: patientData.address || "",
            signatureCandidate: patientData.signature || "",
            date: new Date().toISOString().split("T")[0],
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
        await updatePatientForm(patientId, "25-form-for-medical-fitness-certificate-format", form);
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
      await updatePatientForm(patientId, "25-form-for-medical-fitness-certificate-format", form);
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
    navigate(`/patients/${patientId}/fitness-certificate/preview`);
  }

  return (
    <AppShell patientId={patientId}>
      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
        <Link to={`/patients/${patientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand transition mb-1">
          <span>←</span>
          <span>Back to Patient Dashboard</span>
        </Link>

        {/* Sticky Header */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">Medical Fitness Certificate</span>
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">1. Candidate Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Shri / Kumari / Smt." value={form.name} onChange={(val) => updateField("name", val)} required />
                <Field label="Son / Daughter of Shri" value={form.parentName} onChange={(val) => updateField("parentName", val)} required />
                <Field label="Age" type="number" value={form.age} onChange={(val) => updateField("age", val)} required />
                <Field label="Marks of Identification" value={form.marksOfIdentification} onChange={(val) => updateField("marksOfIdentification", val)} />
              </div>
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resident Address</h4>
                <div className="space-y-3">
                  <Field label="Line 1" value={form.residentOfLine1} onChange={(val) => updateField("residentOfLine1", val)} />
                  <Field label="Line 2" value={form.residentOfLine2} onChange={(val) => updateField("residentOfLine2", val)} />
                  <Field label="Line 3" value={form.residentOfLine3} onChange={(val) => updateField("residentOfLine3", val)} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">2. Medical Officer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name of Medical Officer" value={form.nameMedicalOfficer} onChange={(val) => updateField("nameMedicalOfficer", val)} />
                <Field label="Registration No." value={form.registrationNo} onChange={(val) => updateField("registrationNo", val)} />
                <Field label="Date" type="date" value={form.date} onChange={(val) => updateField("date", val)} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">3. Signatures & Seal</h3>
              
              <ImageCapture 
                label="Candidate Signature" 
                value={form.signatureCandidate} 
                onChange={(val) => updateField("signatureCandidate", val)} 
                showSignaturePad={true}
              />

              <ImageCapture 
                label="Left-Hand Thumb Impression" 
                value={form.leftThumb} 
                onChange={(val) => updateField("leftThumb", val)} 
                showSignaturePad={true}
              />

              <ImageCapture 
                label="Medical Officer Signature" 
                value={form.signatureMedicalOfficer} 
                onChange={(val) => updateField("signatureMedicalOfficer", val)} 
                showSignaturePad={true}
              />

              <ImageCapture 
                label="Official Seal" 
                value={form.seal} 
                onChange={(val) => updateField("seal", val)} 
                showSignaturePad={false}
              />
            </div>
          </div>
        </div>
      </form>
    </AppShell>
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

function ImageCapture({ label, value, onChange, showSignaturePad }) {
  const [mode, setMode] = useState("upload");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
      <label className="field-label font-bold text-slate-600 block">{label}</label>
      
      {value ? (
        <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-4">
          <img src={value} alt={label} className="max-h-24 object-contain" />
          <button 
            type="button" 
            onClick={() => onChange("")} 
            className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-100 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {showSignaturePad && (
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setMode("upload")} 
                className={`flex-1 text-center py-1 text-xxs font-bold rounded-lg border transition ${
                  mode === "upload" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Upload File
              </button>
              <button 
                type="button" 
                onClick={() => setMode("draw")} 
                className={`flex-1 text-center py-1 text-xxs font-bold rounded-lg border transition ${
                  mode === "draw" ? "bg-brand text-white border-brand" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                Draw Sign
              </button>
            </div>
          )}

          {mode === "upload" || !showSignaturePad ? (
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="border-2 border-dashed border-slate-200 hover:border-brand rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <span className="text-xxs font-bold text-slate-500">Click to upload image</span>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <SignaturePadCanvas onChange={onChange} />
          )}
        </div>
      )}
    </div>
  );
}

function SignaturePadCanvas({ onChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000000";
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (e.touches) e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onChange("");
    }
  };

  return (
    <div className="space-y-1.5">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={100} 
        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button 
        type="button" 
        onClick={clear} 
        className="w-full text-center py-1 text-[10px] font-bold text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
      >
        Clear Sketch
      </button>
    </div>
  );
}
