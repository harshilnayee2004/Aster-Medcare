import { useState } from "react";
import api from "../services/api";

export default function FileUpload({ patientId, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState("Other");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const categories = ["X-Ray", "ECG", "Lab Report", "Other"];

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  }

  async function uploadFile(file) {
    // 5MB limit check (optional but good practice)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      await api.post(`/patients/${patientId}/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (onUploadSuccess) onUploadSuccess();
      }, 1000);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.message || "File upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Picker */}
      <div>
        <label className="field-label font-semibold text-slate-700 mb-2 block">Select File Category</label>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition active:scale-95 ${
                category === cat
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all ${
          dragActive
            ? "border-brand bg-blue-50/50 scale-[0.99] shadow-soft"
            : "border-slate-300 bg-white hover:border-brand hover:bg-slate-50/40"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>

        <div className="mt-4 flex text-sm text-slate-600 justify-center">
          <label htmlFor="dashboard-file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-brand focus-within:outline-none hover:text-blue-700">
            <span>Upload a file</span>
            <input
              id="dashboard-file-upload"
              name="file"
              type="file"
              className="sr-only"
              onChange={handleChange}
              disabled={uploading}
            />
          </label>
          <p className="pl-1 text-slate-400">or drag and drop</p>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">PDF, PNG, JPG, or DOC up to 10MB</p>

        {/* Progress Bar overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-xl px-8">
            <span className="text-sm font-semibold text-slate-700 animate-pulse mb-3">
              Uploading {category} File... {progress}%
            </span>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 max-w-md">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}
