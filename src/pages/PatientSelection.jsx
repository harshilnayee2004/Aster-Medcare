import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// Import form templates for off-screen rendering
import HealthRegisterTemplate from "./HealthRegisterTemplate.jsx";
import EyeExamTemplate from "./EyeExamTemplate.jsx";
import Form33Template from "./Form33Template.jsx";
import PostMedicalTemplate from "./PostMedicalTemplate.jsx";
import XRayReportTemplate from "./XRayReportTemplate.jsx";

const ALL_24_FORMS = [
  { key: "postMedical", label: "Post Medical Evaluation" },
  { key: "eyeExam", label: "Eye Examination" },
  { key: "form33", label: "Form No. 33 (Fitness)" },
  { key: "healthRegister", label: "Form No. 32 (Health Register)" },
  { key: "xrayReport", label: "X-Ray Report" },
  ...Array.from({ length: 19 }, (_, i) => {
    const num = String(i + 6).padStart(2, "0");
    return { key: `form${num}`, label: `Medical Form ${num} (Placeholder)` };
  })
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
      const status = patient.forms?.postMedical?.data?.fitStatus;
      if (fitFilter === "Fit") {
        matchesFit = status === "Fit";
      } else if (fitFilter === "Unfit") {
        matchesFit = status === "Unfit";
      }
    }

    return matchesSearch && matchesCompany && matchesGender && matchesFit;
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
          forms.healthRegister?.savedAt,
          forms.eyeExam?.savedAt,
          forms.form33?.savedAt,
          forms.postMedical?.savedAt,
          forms.xrayReport?.savedAt
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
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Options */}
        <section className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Selection</h1>
          <p className="mt-1 text-sm text-slate-500">Register a new patient or continue managing diagnostics for an existing worker.</p>
          
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link 
              to="/patients/new" 
              className="group flex flex-col justify-center rounded-xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">New Patient Registration</span>
              <span className="mt-1 text-sm text-slate-400">Add details and generate a unique Patient ID</span>
            </Link>
            
            <a 
              href="#existing" 
              className="group flex flex-col justify-center rounded-xl border border-line bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">Existing Patient Search</span>
              <span className="mt-1 text-sm text-slate-400">Search and open profiles of saved patients</span>
            </a>
          </div>
        </section>

        {/* Directory Listing */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading patients...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <section id="existing" className="rounded-xl border border-line bg-white p-6 sm:p-8 shadow-soft scroll-mt-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Existing Patients</h2>
                <p className="mt-1 text-sm text-slate-500">Registered records saved in database.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-brand transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download All Reports</span>
                </button>
                
                <div className="relative w-full sm:max-w-xs">
                  <input 
                    className="input pr-10" 
                    placeholder="Search patient name, ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Filters row */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-6">
              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Filter by Company</label>
                <select 
                  className="input !py-1.5 !px-3 text-xs" 
                  value={companyFilter} 
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="All">All Companies</option>
                  {uniqueCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Filter by Gender</label>
                <select 
                  className="input !py-1.5 !px-3 text-xs" 
                  value={genderFilter} 
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Filter by Fit Status</label>
                <select 
                  className="input !py-1.5 !px-3 text-xs" 
                  value={fitFilter} 
                  onChange={(e) => setFitFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Fit">Fit</option>
                  <option value="Unfit">Unfit</option>
                </select>
              </div>
            </div>

            {/* Patients Table */}
            <div className="overflow-hidden rounded-xl border border-line">
              {filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400 italic">No patients match the active search filters.</div>
              ) : (
                <div className="min-w-full divide-y divide-line">
                  <div className="bg-slate-50/70 hidden sm:grid sm:grid-cols-[1.3fr_1fr_1.2fr_auto] items-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Patient Name</span>
                    <span>Patient ID</span>
                    <span>Company / Factory</span>
                    <span className="text-right pr-4">Action</span>
                  </div>
                  
                  <div className="divide-y divide-line bg-white">
                    {filteredPatients.map((patient) => (
                      <Link
                        key={patient.patientId}
                        to={`/patients/${patient.patientId}`}
                        className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr_1.2fr_auto] items-center px-6 py-4.5 text-sm transition hover:bg-slate-50/50"
                      >
                        <div className="flex flex-col gap-0.5 sm:block">
                          <span className="font-semibold text-slate-800">{patient.name}</span>
                          <span className="text-xs text-slate-400 sm:hidden mt-0.5">{patient.patientId}</span>
                        </div>
                        <span className="hidden sm:inline font-mono font-medium text-brand">{patient.patientId}</span>
                        <span className="text-slate-500 mt-1 sm:mt-0 text-xs sm:text-sm">{patient.company || "Aster Medcare"}</span>
                        <span className="mt-3 sm:mt-0 text-xs sm:text-sm font-semibold text-brand text-right pr-4 transition flex items-center justify-end gap-1">
                          Open Dashboard 
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
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
                    {ALL_24_FORMS.slice(0, 5).map(f => (
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
        </div>
      )}
    </AppShell>
  );
}
