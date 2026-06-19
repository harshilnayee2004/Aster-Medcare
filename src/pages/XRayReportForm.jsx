import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import { getPatient, updatePatientForm } from "../utils/localStorage.js";

export default function XRayReportForm() {
  const { patientId } = useParams();
  const patient = getPatient(patientId);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    photo: "",
    ...(patient?.xrayReport || {})
  });

  if (!patient) return <Navigate to="/patients" replace />;

  function handlePhoto(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ photo: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function save() {
    updatePatientForm(patientId, "xrayReport", form);
  }

  function submit(event) {
    event.preventDefault();
    save();
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">X-Ray Report</h1>
            <p className="mt-2 text-muted">Upload patient chest X-Ray or medical scans · {patient.name} · {patient.patientId}</p>
          </div>
          <div className="flex gap-3">
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
