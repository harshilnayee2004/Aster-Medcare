import { useEffect, useState } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import FormCard from "../components/FormCard.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { formatDateTime, getPatient, updatePatientForm } from "../utils/localStorage.js";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Doctor Review state
  const [reviewStatus, setReviewStatus] = useState("FIT");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const hasAccess = (formKey) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin" || currentUser.role === "doctor") return true;
    return currentUser.formAccess?.includes(formKey);
  };

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error("Failed to load patient:", err);
        setError("Patient record not found.");
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [patientId]);

  useEffect(() => {
    if (patient) {
      const pmData = patient.forms?.postMedical?.data || {};
      setReviewStatus(pmData.fitStatus || "FIT");
      setReviewRemarks(pmData.treatmentRecommendation || "");
      
      let initialDate = "";
      if (pmData.certificateDate) {
        initialDate = pmData.certificateDate.split("T")[0];
      } else if (patient.forms?.postMedical?.savedAt) {
        initialDate = patient.forms.postMedical.savedAt.split("T")[0];
      }
      setReviewDate(initialDate);
    }
  }, [patient]);

  if (loading) {
    return (
      <AppShell patientId={patientId}>
        <div className="text-center py-20 text-slate-500 font-medium animate-pulse">Loading patient details...</div>
      </AppShell>
    );
  }

  if (error || !patient) {
    return <Navigate to="/patients" replace />;
  }

  const forms = patient.forms || {};
  const activities = [
    forms.form33?.savedAt && ["Form No. 33 completed", forms.form33.savedAt],
    forms.postMedical?.savedAt && ["Post Medical evaluation completed", forms.postMedical.savedAt],
    forms.eyeExam?.savedAt && ["Eye examination completed", forms.eyeExam.savedAt],
    forms.healthRegister?.savedAt && ["Health Register completed", forms.healthRegister.savedAt],
    forms.xrayReport?.savedAt && ["X-Ray Report completed", forms.xrayReport.savedAt],
    forms["4-form-airport-bohw"]?.savedAt && ["Form No. XI (Factory & BOCW) completed", forms["4-form-airport-bohw"].savedAt],
    forms["5-form-height-pass"]?.savedAt && ["Height Pass Test Report completed", forms["5-form-height-pass"].savedAt],
    forms["10-form-ophthal-form-6"]?.savedAt && ["Ophthalmic Form 6 completed", forms["10-form-ophthal-form-6"].savedAt],
    forms["11-form-audiometry-front"]?.savedAt && ["Audiometry Report (Front) completed", forms["11-form-audiometry-front"].savedAt],
    forms["18-form-vaccine-ircs-forms-2"]?.savedAt && ["Vaccination Certificate completed", forms["18-form-vaccine-ircs-forms-2"].savedAt],
    forms["25-form-for-medical-fitness-certificate-format"]?.savedAt && ["Medical Fitness Certificate completed", forms["25-form-for-medical-fitness-certificate-format"].savedAt],
    forms["26-form-death-certificate"]?.savedAt && ["Death Certificate completed", forms["26-form-death-certificate"].savedAt],
    forms["35-form-airport-bohw-ht-front"]?.savedAt && ["Airport BOHW-HT Front completed", forms["35-form-airport-bohw-ht-front"].savedAt],
    forms["36-form-airport-bohw-ht-back"]?.savedAt && ["Airport BOHW-HT Back completed", forms["36-form-airport-bohw-ht-back"].savedAt],
    forms["17-form-food-handler-certificate"]?.savedAt && ["Food Handler Certificate completed", forms["17-form-food-handler-certificate"].savedAt],
    forms["15-form-vaccination-front"]?.savedAt && ["Vaccination Front completed", forms["15-form-vaccination-front"].savedAt],
    forms["16-form-vaccination-back"]?.savedAt && ["Vaccination Back completed", forms["16-form-vaccination-back"].savedAt],
    forms["13-form-pft-front"]?.savedAt && ["PFT Front completed", forms["13-form-pft-front"].savedAt],
    ["Patient registered", patient.createdAt],
  ].filter((item) => item && item[1]);

  const completedCount = [
    forms.healthRegister?.savedAt,
    forms.eyeExam?.savedAt,
    forms.form33?.savedAt,
    forms.postMedical?.savedAt,
    forms.xrayReport?.savedAt,
    forms["4-form-airport-bohw"]?.savedAt,
    forms["5-form-height-pass"]?.savedAt,
    forms["10-form-ophthal-form-6"]?.savedAt,
    forms["11-form-audiometry-front"]?.savedAt,
    forms["18-form-vaccine-ircs-forms-2"]?.savedAt,
    forms["25-form-for-medical-fitness-certificate-format"]?.savedAt,
    forms["26-form-death-certificate"]?.savedAt,
    forms["35-form-airport-bohw-ht-front"]?.savedAt,
    forms["36-form-airport-bohw-ht-back"]?.savedAt,
    forms["17-form-food-handler-certificate"]?.savedAt,
    forms["15-form-vaccination-front"]?.savedAt,
    forms["16-form-vaccination-back"]?.savedAt,
    forms["13-form-pft-front"]?.savedAt
  ].filter(Boolean).length;

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      setSavingReview(true);
      const currentPostForm = forms.postMedical?.data || {};
      const updatedData = {
        ...currentPostForm,
        fitStatus: reviewStatus,
        treatmentRecommendation: reviewRemarks,
        certificateDate: reviewDate
      };
      
      await updatePatientForm(patientId, "postMedical", updatedData);
      
      // Reload patient details to update state
      const updatedPatient = await getPatient(patientId);
      setPatient(updatedPatient);
      alert("Doctor evaluation saved successfully!");
    } catch (err) {
      console.error("Failed to save doctor review:", err);
      alert("Failed to save doctor review. Please try again.");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this patient record? This action cannot be undone!")) {
      return;
    }
    try {
      await api.delete(`/patients/${patientId}`);
      alert("Patient record deleted successfully.");
      navigate("/patients");
    } catch (err) {
      console.error("Failed to delete patient:", err);
      alert("Failed to delete patient. Please try again.");
    }
  };

  const fitStatusVal = forms.postMedical?.data?.fitStatus || "";

  return (
    <AppShell patientId={patientId}>
      <div className="space-y-6">
        {/* Redesigned Premium Patient Header */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-2xl font-bold text-brand shadow-inner border border-blue-100/50 shrink-0">
                {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">{patient.name}</h1>
                  {fitStatusVal && (
                    <span className={`text-xxs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      fitStatusVal.toUpperCase() === "FIT"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                      {fitStatusVal}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient ID:</span>
                  <span className="font-mono rounded bg-blue-50/50 px-2.5 py-0.5 text-xs font-bold text-brand border border-blue-100/50">{patient.patientId}</span>
                </div>
              </div>
            </div>

            {currentUser?.role === "admin" && (
              <button
                onClick={handleDeletePatient}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition duration-150 border border-red-200/50 outline-none focus:ring-2 focus:ring-red-200"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Patient
              </button>
            )}
          </div>

          {/* Demographics Chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Age:</span>
              <span className="text-sm font-bold text-slate-700">{patient.age} Yrs</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Gender:</span>
              <span className="text-sm font-bold text-slate-700">{patient.gender}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Mobile:</span>
              <span className="text-sm font-bold text-slate-700">{patient.mobile || "-"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Company:</span>
              <span className="text-sm font-bold text-slate-700">{patient.company || "Aster Medcare"}</span>
            </div>
            {patient.fatherName && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Father's Name:</span>
                <span className="text-sm font-bold text-slate-700">{patient.fatherName}</span>
              </div>
            )}
            {patient.occupation && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Occupation:</span>
                <span className="text-sm font-bold text-slate-700">{patient.occupation}</span>
              </div>
            )}
          </div>
        </section>

        {/* Dossier compiled actions banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Compiled Medical Dossier</h2>
            <p className="mt-1 text-sm text-slate-300">Generate a unified PDF containing all completed medical forms, ready for download and sharing.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Progress:</span>
              <span className="text-white">
                {completedCount} of 18 forms completed
              </span>
            </div>
          </div>
          <Link
            to={`/patients/${patientId}/full-report/preview`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-98 shadow-sm whitespace-nowrap"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Generate Full Report
          </Link>
        </section>

        {/* Medical Forms Section */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Medical Forms</h2>
            <p className="mt-1 text-sm text-slate-500">Select any medical evaluation form below to enter patient diagnostics.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl">
            <FormCard
              title="Pre Medical Check-Up Form"
              icon="PR"
              status={forms.preMedical?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.preMedical?.savedAt}
              to={`/patients/${patientId}/pre-medical`}
              disabled={!hasAccess("preMedical")}
            />
            <FormCard
              title="Post Medical Evaluation"
              icon="PM"
              status={forms.postMedical?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.postMedical?.savedAt}
              to={`/patients/${patientId}/post-medical`}
              disabled={!hasAccess("postMedical")}
            />
            <FormCard
              title="Eye Examination"
              icon="EX"
              status={forms.eyeExam?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.eyeExam?.savedAt}
              to={`/patients/${patientId}/eye-exam`}
              disabled={!hasAccess("eyeExam")}
            />
            <FormCard
              title="Form No. 33"
              icon="33"
              status={forms.form33?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.form33?.savedAt}
              to={`/patients/${patientId}/form-33`}
              disabled={!hasAccess("form33")}
            />
            <FormCard
              title="Form No. 32"
              icon="32"
              status={forms.healthRegister?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.healthRegister?.savedAt}
              to={`/patients/${patientId}/health-register`}
              disabled={!hasAccess("healthRegister")}
            />
            <FormCard
              title="X-Ray Report"
              icon="XR"
              status={forms.xrayReport?.savedAt ? "Completed" : "Pending"}
              savedAt={forms.xrayReport?.savedAt}
              to={`/patients/${patientId}/xray-report`}
              disabled={!hasAccess("xrayReport")}
            />
            <FormCard
              title="Form No. XI (Factory & BOCW)"
              icon="XI"
              status={forms["4-form-airport-bohw"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["4-form-airport-bohw"]?.savedAt}
              to={`/patients/${patientId}/airport-bohw`}
              disabled={!hasAccess("4-form-airport-bohw")}
            />
            <FormCard
              title="Height Pass Test Report"
              icon="HP"
              status={forms["5-form-height-pass"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["5-form-height-pass"]?.savedAt}
              to={`/patients/${patientId}/height-pass`}
              disabled={!hasAccess("5-form-height-pass")}
            />
            <FormCard
              title="Ophthalmic Form 6"
              icon="OP"
              status={forms["10-form-ophthal-form-6"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["10-form-ophthal-form-6"]?.savedAt}
              to={`/patients/${patientId}/ophthal-form-6`}
              disabled={!hasAccess("10-form-ophthal-form-6")}
            />
            <FormCard
              title="Audiometry Report (Front)"
              icon="AD"
              status={forms["11-form-audiometry-front"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["11-form-audiometry-front"]?.savedAt}
              to={`/patients/${patientId}/audiometry-front`}
              disabled={!hasAccess("11-form-audiometry-front")}
            />
            <FormCard
              title="Vaccination Certificate"
              icon="VC"
              status={forms["18-form-vaccine-ircs-forms-2"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["18-form-vaccine-ircs-forms-2"]?.savedAt}
              to={`/patients/${patientId}/vaccine-certificate`}
              disabled={!hasAccess("18-form-vaccine-ircs-forms-2")}
            />
            <FormCard
              title="Medical Fitness Certificate"
              icon="FC"
              status={forms["25-form-for-medical-fitness-certificate-format"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["25-form-for-medical-fitness-certificate-format"]?.savedAt}
              to={`/patients/${patientId}/fitness-certificate`}
              disabled={!hasAccess("25-form-for-medical-fitness-certificate-format")}
            />
            <FormCard
              title="Death Certificate"
              icon="DC"
              status={forms["26-form-death-certificate"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["26-form-death-certificate"]?.savedAt}
              to={`/patients/${patientId}/death-certificate`}
              disabled={!hasAccess("26-form-death-certificate")}
            />
            <FormCard
              title="Airport BOHW-HT Front"
              icon="AP"
              status={forms["35-form-airport-bohw-ht-front"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["35-form-airport-bohw-ht-front"]?.savedAt}
              to={`/patients/${patientId}/airport-bohw-ht-front`}
              disabled={!hasAccess("35-form-airport-bohw-ht-front")}
            />
            <FormCard
              title="Airport BOHW-HT Back"
              icon="AB"
              status={forms["36-form-airport-bohw-ht-back"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["36-form-airport-bohw-ht-back"]?.savedAt}
              to={`/patients/${patientId}/airport-bohw-ht-back`}
              disabled={!hasAccess("36-form-airport-bohw-ht-back")}
            />
            <FormCard
              title="Food Handler Certificate"
              icon="FH"
              status={forms["17-form-food-handler-certificate"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["17-form-food-handler-certificate"]?.savedAt}
              to={`/patients/${patientId}/food-handler`}
              disabled={!hasAccess("17-form-food-handler-certificate")}
            />
            <FormCard
              title="Vaccination Front"
              icon="VF"
              status={forms["15-form-vaccination-front"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["15-form-vaccination-front"]?.savedAt}
              to={`/patients/${patientId}/vaccination-front`}
              disabled={!hasAccess("15-form-vaccination-front")}
            />
            <FormCard
              title="Vaccination Back"
              icon="VB"
              status={forms["16-form-vaccination-back"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["16-form-vaccination-back"]?.savedAt}
              to={`/patients/${patientId}/vaccination-back`}
              disabled={!hasAccess("16-form-vaccination-back")}
            />
            <FormCard
              title="PFT Front"
              icon="PF"
              status={forms["13-form-pft-front"]?.savedAt ? "Completed" : "Pending"}
              savedAt={forms["13-form-pft-front"]?.savedAt}
              to={`/patients/${patientId}/pft-front`}
              disabled={!hasAccess("13-form-pft-front")}
            />
          </div>
        </section>

        {/* File Attachments Section */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Patient Attachments</h2>
              <p className="mt-1 text-sm text-slate-500">Upload and manage diagnostic scans, laboratory reports, or general files.</p>
            </div>
            <FileUpload 
              patientId={patientId} 
              onUploadSuccess={async () => {
                const data = await getPatient(patientId);
                setPatient(data);
              }} 
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Attached Documents ({patient.files?.length || 0})</h3>
            
            {!patient.files || patient.files.length === 0 ? (
              <div className="h-44 flex items-center justify-center border border-slate-100 rounded-2xl bg-slate-50/50 text-sm text-slate-400 italic">
                No attachments uploaded for this patient yet.
              </div>
            ) : (
              <div className="divide-y divide-line border border-slate-100 rounded-2xl overflow-hidden bg-white max-h-[320px] overflow-y-auto">
                {patient.files.map((file) => (
                  <div key={file._id} className="flex items-center justify-between p-4 text-sm transition hover:bg-slate-50/50">
                    <div className="space-y-1.5 max-w-[70%]">
                      <p className="font-semibold text-slate-800 truncate" title={file.fileName}>{file.fileName}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${
                          file.category === "X-Ray" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          file.category === "ECG" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          file.category === "Lab Report" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {file.category}
                        </span>
                        <span>&bull;</span>
                        <span>{formatDateTime(file.uploadedAt)}</span>
                        {file.uploadedBy && (
                          <>
                            <span>&bull;</span>
                            <span>By: {file.uploadedBy.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-brand transition"
                        title="Download / View File"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to permanently delete this file?")) {
                            try {
                              await api.delete(`/patients/${patientId}/files/${file._id}`);
                              const data = await getPatient(patientId);
                              setPatient(data);
                            } catch (err) {
                              console.error("Failed to delete file:", err);
                              alert("Failed to delete file. Please try again.");
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Delete File"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Doctor Review Card (Admin & Doctor roles only) */}
        {(currentUser?.role === "admin" || currentUser?.role === "doctor") && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Doctor Remarks & Evaluation</h2>
              <p className="mt-1 text-sm text-slate-500">Submit final fitness decisions and comments for this worker.</p>
            </div>
            
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Worker Fitness Status</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-brand"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                  >
                    <option value="FIT">FIT</option>
                    <option value="UNFIT">UNFIT</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Evaluation Date</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none focus:border-brand"
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setReviewDate(new Date().toISOString().split("T")[0])}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Treatment / Recommendation Remarks</label>
                <textarea
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand"
                  placeholder="Type Rx details, findings, or recommendations..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={savingReview}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                  {savingReview ? "Saving Remarks..." : "Save Remarks & Review"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Recent Activity Section */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Recent Activity</h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">History</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map(([label, date]) => (
              <div key={`${label}-${date}`} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1.5 text-xs text-slate-400 font-medium">{formatDateTime(date)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
