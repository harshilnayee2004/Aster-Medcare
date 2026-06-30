import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Import form templates for off-screen rendering
import PreMedicalTemplate from "./PreMedicalTemplate.jsx";
import HealthRegisterTemplate from "./HealthRegisterTemplate.jsx";
import EyeExamTemplate from "./EyeExamTemplate.jsx";
import Form33Template from "./Form33Template.jsx";
import PostMedicalTemplate from "./PostMedicalTemplate.jsx";
import XRayReportTemplate from "./XRayReportTemplate.jsx";
import AirportBohwTemplate from "./AirportBohwTemplate.jsx";
import HeightPassTemplate from "./HeightPassTemplate.jsx";
import OphthalForm6Template from "./OphthalForm6Template.jsx";
import AudiometryFrontTemplate from "./AudiometryFrontTemplate.jsx";
import VaccineCertificateTemplate from "./VaccineCertificateTemplate.jsx";
import FitnessCertificateTemplate from "./FitnessCertificateTemplate.jsx";
import DeathCertificateTemplate from "./DeathCertificateTemplate.jsx";
import AirportBohwHtFrontTemplate from "./AirportBohwHtFrontTemplate.jsx";
import AirportBohwHtBackTemplate from "./AirportBohwHtBackTemplate.jsx";
import FoodHandlerTemplate from "./FoodHandlerTemplate.jsx";
import VaccinationFrontTemplate from "./VaccinationFrontTemplate.jsx";
import VaccinationBackTemplate from "./VaccinationBackTemplate.jsx";

const ALL_24_FORMS = [
  { key: "preMedical", label: "Pre Medical Check-Up Form" },
  { key: "postMedical", label: "Post Medical Evaluation" },
  { key: "eyeExam", label: "Eye Examination" },
  { key: "form33", label: "Form No. 33 (Fitness)" },
  { key: "healthRegister", label: "Form No. 32 (Health Register)" },
  { key: "xrayReport", label: "X-Ray Report" },
  { key: "4-form-airport-bohw", label: "Form No. XI (Factory & BOCW)" },
  { key: "5-form-height-pass", label: "Height Pass Test Report" },
  { key: "10-form-ophthal-form-6", label: "Ophthalmic Form 6 (Eye Examination)" },
  { key: "11-form-audiometry-front", label: "Audiometry Report (Front)" },
  { key: "17-form-food-handler-certificate", label: "Food Handler Certificate" },
  { key: "15-form-vaccination-front", label: "Vaccination Front" },
  { key: "16-form-vaccination-back", label: "Vaccination Back" },
  { key: "18-form-vaccine-ircs-forms-2", label: "ASHTAM Adult Vaccination Certificate" },
  { key: "25-form-for-medical-fitness-certificate-format", label: "Medical Fitness Certificate" },
  { key: "26-form-death-certificate", label: "Death Certificate" },
  { key: "35-form-airport-bohw-ht-front", label: "Airport BOHW-HT Front" },
  { key: "36-form-airport-bohw-ht-back", label: "Airport BOHW-HT Back" },
  { key: "form09", label: "Medical Form 09 (Placeholder)" },
  { key: "form10", label: "Medical Form 10 (Placeholder)" },
  { key: "form12", label: "Medical Form 12 (Placeholder)" },
  { key: "form13", label: "Medical Form 13 (Placeholder)" },
  { key: "form14", label: "Medical Form 14 (Placeholder)" },
  { key: "form23", label: "Medical Form 23 (Placeholder)" }
];

export default function PatientSelection() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Directory Search/Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [fitFilter, setFitFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  // Bulk Download Modal States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [modalCompany, setModalCompany] = useState("All");
  const [modalFromDate, setModalFromDate] = useState("");
  const [modalToDate, setModalToDate] = useState("");
  const [modalFormType, setModalFormType] = useState("All");

  // ZIP Generation Pipeline States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [pdfPatient, setPdfPatient] = useState(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        const res = await api.get("/patients");
        setPatients(res.data || []);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError("Could not retrieve patient records. Please make sure the server is running.");
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  // Compute unique companies for filters
  const uniqueCompanies = Array.from(
    new Set(patients.map((p) => p.company).filter(Boolean))
  ).sort();

  // Dynamic filtering of directory table
  const filteredPatients = patients.filter((patient) => {
    const searchStr = `${patient.name} ${patient.patientId} ${patient.company}`.toLowerCase();
    const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());

    const matchesCompany = companyFilter === "All" || patient.company === companyFilter;
    const matchesGender = genderFilter === "All" || patient.gender === genderFilter;

    let matchesFit = true;
    if (fitFilter !== "All") {
      const status = patient.forms?.postMedical?.data?.fitStatus || "";
      if (fitFilter === "Fit") {
        matchesFit = status.toUpperCase() === "FIT";
      } else if (fitFilter === "Unfit") {
        matchesFit = status.toUpperCase() === "UNFIT";
      }
    }

    const matchesDate = (() => {
      if (dateFilter === "All") return true;
      if (!patient.createdAt) return false;
      const regDate = new Date(patient.createdAt);
      const now = new Date();
      if (dateFilter === "Today") {
        return regDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "This Week") {
        const diffTime = Math.abs(now - regDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === "This Month") {
        const diffTime = Math.abs(now - regDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      return true;
    })();

    return matchesSearch && matchesCompany && matchesGender && matchesFit && matchesDate;
  });

  // ZIP generation pipeline
  const handleBulkDownload = async (e) => {
    e.preventDefault();
    setGenerationError("");
    setIsGenerating(true);
    setGenerationProgress("Querying records from database...");

    try {
      const params = {};
      if (modalCompany && modalCompany !== "All") params.company = modalCompany;
      if (modalFromDate) params.fromDate = modalFromDate;
      if (modalToDate) params.toDate = modalToDate;
      if (modalFormType && modalFormType !== "All") params.formType = modalFormType;

      const res = await api.get("/patients", { params });
      const targetPatients = res.data || [];

      if (targetPatients.length === 0) {
        throw new Error("No patients found matching the selected filters.");
      }

      setGenerationProgress(`Found ${targetPatients.length} patients. Compiling reports...`);
      const zip = new JSZip();
      let compiledCount = 0;

      for (let i = 0; i < targetPatients.length; i++) {
        const partialPatient = targetPatients[i];
        setGenerationProgress(`[${i + 1}/${targetPatients.length}] Loading details for ${partialPatient.name}...`);

        const fullRes = await api.get(`/patients/${partialPatient.patientId}`);
        const fullPatient = fullRes.data;

        const forms = fullPatient.forms || {};
        const completedFormsCount = [
          forms.preMedical?.savedAt,
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
          forms["16-form-vaccination-back"]?.savedAt
        ].filter(Boolean).length;

        if (completedFormsCount === 0) {
          continue;
        }

        setGenerationProgress(`[${i + 1}/${targetPatients.length}] Rendering PDF for ${fullPatient.name}...`);
        setPdfPatient(fullPatient);

        // Bounded delay for React DOM compilation
        await new Promise((resolve) => setTimeout(resolve, 250));

        const container = document.getElementById("pdf-hidden-renderer");
        if (!container) {
          console.error("Off-screen renderer not found in DOM");
          continue;
        }

        // Wait dynamically for all asynchronous PDF canvases and loading states to settle
        let renderAttempts = 0;
        while (renderAttempts < 80) { // Max 8 seconds
          await new Promise((resolve) => setTimeout(resolve, 100));
          const text = container.innerText || "";
          if (!text.includes("Rendering page") && 
              !text.includes("Stamping data") && 
              !text.includes("Loading")) {
            // Give an extra 100ms for stable layout paint
            await new Promise((resolve) => setTimeout(resolve, 100));
            break;
          }
          renderAttempts++;
        }

        const pageElements = container.getElementsByClassName("pdf-page");
        if (pageElements.length === 0) {
          continue;
        }

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        for (let pageIdx = 0; pageIdx < pageElements.length; pageIdx++) {
          const el = pageElements[pageIdx];

          const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          if (pageIdx > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
        }

        const pdfBlob = pdf.output("blob");
        const sanitizedName = fullPatient.name.replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `${sanitizedName}_${fullPatient.patientId}_Combined_Medical_Report.pdf`;
        zip.file(filename, pdfBlob);

        compiledCount++;
      }

      if (compiledCount === 0) {
        throw new Error("None of the matched patients have any completed medical forms to export.");
      }

      setGenerationProgress("Compressing reports into ZIP archive...");
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Aster_Medcare_Reports_Batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setGenerationProgress("Success! ZIP downloaded.");
      setTimeout(() => {
        setIsGenerating(false);
        setIsDownloadModalOpen(false);
        setPdfPatient(null);
      }, 1500);

    } catch (err) {
      console.error("Bulk PDF export failed:", err);
      setGenerationError(err.message || "Failed to generate bulk reports ZIP file.");
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Patient Records</h1>
            <p className="text-sm text-slate-500 mt-1">Search and manage all registered patients</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/import"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <svg className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Bulk Import
            </Link>
            <Link
              to="/patients/new"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register New Patient
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-blue-50"
                placeholder="Search patient name, ID, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {/* Bulk Download Button */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <svg className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Bulk PDF Export
            </button>
          </div>

          {/* Chips & Filter Options */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            {/* Date Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Reg Date:</span>
              {["All", "Today", "This Week", "This Month"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setDateFilter(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                    dateFilter === chip
                      ? "bg-brand text-white shadow-xxs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Select dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company:</span>
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="All">All Companies</option>
                  {uniqueCompanies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender:</span>
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand"
                  value={fitFilter}
                  onChange={(e) => setFitFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Fit">Fit</option>
                  <option value="Unfit">Unfit</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading patients...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500 px-1">
              <span>Showing <strong>{filteredPatients.length}</strong> {filteredPatients.length === 1 ? "patient" : "patients"}</span>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-base font-bold text-slate-800">No patients found</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-xs mx-auto">We couldn't find any patient matching your selected filters. Try broadening your query or clear filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCompanyFilter("All");
                    setGenderFilter("All");
                    setFitFilter("All");
                    setDateFilter("All");
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => {
                  const fitStatus = patient.forms?.postMedical?.data?.fitStatus || "Pending";
                  let badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-100";
                  if (fitStatus.toUpperCase() === "FIT") badgeColor = "bg-green-50 text-green-700 border-green-100";
                  if (fitStatus.toUpperCase() === "UNFIT") badgeColor = "bg-red-50 text-red-700 border-red-100";

                  const regDateStr = patient.createdAt
                    ? new Date(patient.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "N/A";

                  return (
                    <Link
                      key={patient.patientId}
                      to={`/patients/${patient.patientId}`}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition duration-200"
                    >
                      <div className="space-y-4">
                        {/* ID and Status */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                            {patient.patientId}
                          </span>
                          <span className={`text-xxs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                            {fitStatus}
                          </span>
                        </div>

                        {/* Name and Company */}
                        <div>
                          <h3 className="text-base font-bold text-slate-800 group-hover:text-brand transition truncate">
                            {patient.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{patient.company || "Aster Medcare"}</p>
                        </div>

                        {/* Age and Gender */}
                        <div className="grid grid-cols-2 gap-y-2 pt-3 border-t border-slate-50 text-xxs font-semibold text-slate-505">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Age:</span>
                            <span className="text-slate-700 font-bold">{patient.age} yrs</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Gender:</span>
                            <span className="text-slate-700 font-bold">{patient.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xxs text-slate-400 font-medium">Registered: {regDateStr}</span>
                        <span className="text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Open Profile
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Bulk Reports PDF Export</h2>
              <button 
                onClick={() => !isGenerating && setIsDownloadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
                disabled={isGenerating}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isGenerating ? (
              <div className="py-8 space-y-5 text-center">
                <div className="flex justify-center">
                  <svg className="animate-spin h-10 w-10 text-brand" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-800">Generating Batch ZIP...</p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-50 py-1.5 px-3 rounded-lg max-w-sm mx-auto truncate" title={generationProgress}>
                    {generationProgress}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBulkDownload} className="py-4 space-y-4">
                {generationError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-semibold">
                    {generationError}
                  </div>
                )}

                <div>
                  <label className="field-label">Filter by Company</label>
                  <select 
                    className="input" 
                    value={modalCompany} 
                    onChange={(e) => setModalCompany(e.target.value)}
                  >
                    <option value="All">All Companies</option>
                    {uniqueCompanies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">From Date (Registration)</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={modalFromDate} 
                      onChange={(e) => setModalFromDate(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="field-label">To Date (Registration)</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={modalToDate} 
                      onChange={(e) => setModalToDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Filter by Required Form Type</label>
                  <select 
                    className="input" 
                    value={modalFormType} 
                    onChange={(e) => setModalFormType(e.target.value)}
                  >
                    <option value="All">All Combined (Include All)</option>
                    {ALL_24_FORMS.slice(0, 6).map(f => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                  <p className="text-xxs text-slate-400 mt-1 italic">Only compiles combined reports for patients who have completed the selected form type.</p>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="button-secondary px-5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="button-primary px-5"
                  >
                    Confirm & Download ZIP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hidden container for PDF rendering */}
      {pdfPatient && (
        <div 
          id="pdf-hidden-renderer" 
          className="print-hidden"
          style={{ 
            position: "absolute", 
            left: "-9999px", 
            top: 0, 
            width: "800px", 
            background: "white", 
            zIndex: -1000 
          }}
        >
          {pdfPatient.forms?.preMedical?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <PreMedicalTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.healthRegister?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <HealthRegisterTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.eyeExam?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <EyeExamTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.form33?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <Form33Template hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.postMedical?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <PostMedicalTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.xrayReport?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <XRayReportTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["4-form-airport-bohw"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <AirportBohwTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["5-form-height-pass"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <HeightPassTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["10-form-ophthal-form-6"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <OphthalForm6Template hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["11-form-audiometry-front"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <AudiometryFrontTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["15-form-vaccination-front"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <VaccinationFrontTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["16-form-vaccination-back"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <VaccinationBackTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["17-form-food-handler-certificate"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <FoodHandlerTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["18-form-vaccine-ircs-forms-2"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <VaccineCertificateTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["25-form-for-medical-fitness-certificate-format"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <FitnessCertificateTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["26-form-death-certificate"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <DeathCertificateTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["35-form-airport-bohw-ht-front"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <AirportBohwHtFrontTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
          {pdfPatient.forms?.["36-form-airport-bohw-ht-back"]?.savedAt && (
            <div className="pdf-page bg-white p-8 mb-8" style={{ width: "800px", minHeight: "1120px" }}>
              <AirportBohwHtBackTemplate hideActions={true} patient={pdfPatient} />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
