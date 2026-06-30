import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getPatient } from "../utils/localStorage.js";
import api from "../services/api";

function formatDateToDMY(val) {
  if (!val) return "";
  const parts = val.split("-"); // YYYY-MM-DD
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return val;
}

function PdfPage({ pdfUrl, pageNum }) {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let active = true;
    async function renderPage() {
      try {
        const pdfjsLib = window.pdfjsLib;
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNum);
        
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        
        // Scale to 2.5 for high-resolution print quality
        const viewport = page.getViewport({ scale: 2.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await page.render(renderContext).promise;
        setRendering(false);
      } catch (err) {
        console.error(`Failed to render page ${pageNum}:`, err);
      }
    }
    
    if (window.pdfjsLib) {
      renderPage();
    }
    
    return () => {
      active = false;
    };
  }, [pdfUrl, pageNum]);

  return (
    <div className="relative border border-line rounded-lg overflow-hidden bg-white shadow-sm mb-4 last:mb-0 print:border-none print:rounded-none print:shadow-none print:m-0">
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold animate-pulse print:hidden">
          Rendering page {pageNum}...
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-auto block" />
    </div>
  );
}

export default function VaccinationFrontTemplate({ hideActions = false, patient: propPatient }) {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(propPatient || null);
  const [loading, setLoading] = useState(!propPatient);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (propPatient) {
      setPatient(propPatient);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error("Failed to load patient:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId, propPatient]);

  useEffect(() => {
    if (!patient) return;

    async function fetchPdf() {
      try {
        setLoadingPdf(true);
        const forms = patient.forms || {};
        const actualForm = forms["15-form-vaccination-front"]?.data || {};

        // Stamping mapping
        const values = {
          dataCollectedBy: actualForm.dataCollectedBy || "",
          formNo: actualForm.formNo || "",
          name: actualForm.name || patient.name || "",
          date: formatDateToDMY(actualForm.regDate || ""),
          regDate: formatDateToDMY(actualForm.regDate || ""),
          regTime: actualForm.regTime || "",
          email: actualForm.email || patient.email || "",
          phone: actualForm.phone || patient.mobile || "",
          gender: actualForm.gender || patient.gender || "",
          dob: formatDateToDMY(actualForm.dob || patient.dob || ""),
          age: actualForm.age || (patient.age ? String(patient.age) : ""),
          govtIdProof: actualForm.govtIdProof || "",
          govtIdProofNo: actualForm.govtIdProofNo || patient.aadharNo || "",
          
          // Checkboxes occupation
          occEmployee: actualForm.occupation === "Employee" ? "√" : "",
          occBusinessman: actualForm.occupation === "Businessman" ? "√" : "",
          occStudent: actualForm.occupation === "Student" ? "√" : "",
          
          occupationName: actualForm.occupationName || patient.company || "",
          occupationId: actualForm.occupationId || "",
          bloodGroup: actualForm.bloodGroup || patient.bloodGroup || "",
          address: actualForm.address || patient.address || "",
          city: actualForm.city || patient.city || "",
          state: actualForm.state || patient.state || "",
          pin: actualForm.pin || patient.pinCode || "",
          height: actualForm.height || (patient.height ? String(patient.height) : ""),
          weight: actualForm.weight || (patient.weight ? String(patient.weight) : ""),
          
          // Protect checkboxes
          protectFlu: actualForm.protectFlu ? "√" : "",
          protectHepA: actualForm.protectHepA ? "√" : "",
          protectHpv: actualForm.protectHpv ? "√" : "",
          protectTyphoid: actualForm.protectTyphoid ? "√" : "",
          protectCovid19: actualForm.protectCovid19 ? "√" : "",
          protectPneumonia: actualForm.protectPneumonia ? "√" : "",
          protectHepB: actualForm.protectHepB ? "√" : "",
          protectMeningitis: actualForm.protectMeningitis ? "√" : "",
          protectVaricella: actualForm.protectVaricella ? "√" : "",
          protectOther: actualForm.protectOther ? "√" : "",
          otherSpecify: actualForm.otherSpecify || "",

          // Safety Questionnaire mappings
          q1_yes: actualForm.q1_physicalExam === "YES" ? "√" : "",
          q1_no: actualForm.q1_physicalExam === "YES" ? " " : (actualForm.q1_physicalExam === "NO" ? "√" : ""),
          
          q2_yes: actualForm.q2_feverToday === "YES" ? "√" : "",
          q2_no: actualForm.q2_feverToday === "YES" ? " " : (actualForm.q2_feverToday === "NO" ? "√" : ""),
          
          q3_yes: actualForm.q3_allergies === "YES" ? "√" : "",
          q3_no: actualForm.q3_allergies === "YES" ? " " : (actualForm.q3_allergies === "NO" ? "√" : ""),
          q3_allergicTo: actualForm.q3_allergies === "YES" ? (actualForm.q3_allergicTo || "") : "",
          
          q4_yes: actualForm.q4_seriousReaction === "YES" ? "√" : "",
          q4_no: actualForm.q4_seriousReaction === "YES" ? " " : (actualForm.q4_seriousReaction === "NO" ? "√" : ""),
          
          q5_yes: actualForm.q5_neurological === "YES" ? "√" : "",
          q5_no: actualForm.q5_neurological === "YES" ? " " : (actualForm.q5_neurological === "NO" ? "√" : ""),
          
          q6_yes: actualForm.q6_vaccinesPast28 === "YES" ? "√" : "",
          q6_no: actualForm.q6_vaccinesPast28 === "YES" ? " " : (actualForm.q6_vaccinesPast28 === "NO" ? "√" : ""),
          q6_vaccineList: actualForm.q6_vaccinesPast28 === "YES" ? (actualForm.q6_vaccineList || "") : "",
          
          q7_yes: actualForm.q7_healthProblems === "YES" ? "√" : "",
          q7_no: actualForm.q7_healthProblems === "YES" ? " " : (actualForm.q7_healthProblems === "NO" ? "√" : ""),
          
          q8_yes: actualForm.q8_pregnant === "YES" ? "√" : "",
          q8_no: (actualForm.q8_pregnant === "YES" || actualForm.q8_pregnant === "NA") ? " " : (actualForm.q8_pregnant === "NO" ? "√" : ""),
          q8_na: actualForm.q8_pregnant === "NA" ? "√" : "",
          
          q9_yes: actualForm.q9_immuneProblem === "YES" ? "√" : "",
          q9_no: actualForm.q9_immuneProblem === "YES" ? " " : (actualForm.q9_immuneProblem === "NO" ? "√" : ""),
          
          q10_yes: actualForm.q10_weakenMedication === "YES" ? "√" : "",
          q10_no: actualForm.q10_weakenMedication === "YES" ? " " : (actualForm.q10_weakenMedication === "NO" ? "√" : ""),
          q10_medicationList: actualForm.q10_weakenMedication === "YES" ? (actualForm.q10_medicationList || "") : "",
          
          q11_yes: actualForm.q11_transfusion === "YES" ? "√" : "",
          q11_no: actualForm.q11_transfusion === "YES" ? " " : (actualForm.q11_transfusion === "NO" ? "√" : ""),
          q11_transfusionList: actualForm.q11_transfusion === "YES" ? (actualForm.q11_transfusionList || "") : "",
        };

        const response = await api.post(`/forms/fill/15-form-vaccination-front`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_Vaccination_Front_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate Vaccination Front PDF:", err);
      } finally {
        setLoadingPdf(false);
      }
    }

    fetchPdf();

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [patient]);

  // Load PDFJS pages dynamically
  useEffect(() => {
    if (!pdfUrl) return;

    const scriptId = "pdfjs-cdn-script";
    let script = document.getElementById(scriptId);

    const loadPdfDoc = async () => {
      try {
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        const pagesArray = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pagesArray.push(i);
        }
        setPages(pagesArray);
      } catch (err) {
        console.error("PDFJS document loading failed:", err);
      }
    };

    if (!window.pdfjsLib) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        loadPdfDoc();
      };
      document.body.appendChild(script);
    } else {
      loadPdfDoc();
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions print:hidden">
          <Link to={`/patients/${patientId}/vaccination-front`} className="button-secondary">Back to Form</Link>
          <button onClick={handleDownload} className="button-secondary bg-white text-slate-700 hover:text-brand">Download PDF</button>
          <button onClick={handlePrint} className="button-primary">Print PDF</button>
        </div>
      )}

      {loadingPdf ? (
        <div className="max-w-[800px] mx-auto bg-white p-20 rounded-xl border border-line text-center text-slate-400 font-semibold shadow-soft print:hidden">
          Stamping data onto original PDF template...
        </div>
      ) : pdfUrl ? (
        <div className={hideActions ? "mx-auto max-w-[800px] space-y-4" : "mx-auto max-w-[800px] bg-white border border-line rounded-xl shadow-soft p-5 space-y-4"}>
          {hideActions && (
            <div data-html2canvas-ignore="true" className="flex items-center justify-between border-b border-line pb-3 print:hidden">
              <h3 className="text-sm font-bold text-slate-800">
                Vaccination Front PDF Document (Stamped)
              </h3>
              <button
                onClick={handleDownload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                Download PDF
              </button>
            </div>
          )}
          
          <div className="print:m-0 print:p-0">
            {pages.map((pageNum) => (
              <PdfPage key={pageNum} pdfUrl={pdfUrl} pageNum={pageNum} />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-[800px] mx-auto bg-red-50 p-12 border border-red-200 text-red-700 rounded-xl text-center font-medium print:hidden">
          Failed to load PDF template.
        </div>
      )}
    </main>
  );
}
