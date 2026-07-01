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

export default function Form33Template({ hideActions = false, patient: propPatient }) {
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
        const actualForm = forms.form33?.data || {};
        const savedAt = forms.form33?.savedAt;

        // Split residence
        const res = actualForm.residence || patient.address || "";
        let resLine1 = res;
        let resLine2 = "";
        if (res.length > 30) {
          const lastSpace = res.lastIndexOf(" ", 30);
          if (lastSpace > 10) {
            resLine1 = res.substring(0, lastSpace);
            resLine2 = res.substring(lastSpace + 1);
          } else {
            resLine1 = res.substring(0, 30);
            resLine2 = res.substring(30);
          }
        }

        // Gender pronouns
        const genderLower = String(actualForm.sex || patient.gender || "").toLowerCase();
        const pronounHisHer = genderLower.includes("female") ? "her" : "his";
        const pronounHeShe = genderLower.includes("female") ? "she" : "he";

        // Main Date & Time formatted string
        const examDateStr = formatDateToDMY(actualForm.examinationDate || (savedAt ? savedAt.split("T")[0] : ""));
        let timeStr = "";
        const signDateToUse = actualForm.doctorSignatureDate || savedAt;
        if (signDateToUse) {
          const d = new Date(signDateToUse);
          if (!isNaN(d.getTime())) {
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
          }
        }
        const certDateTime = `DATE: ${examDateStr}      ${timeStr}`;

        // Re-examination dates formatted
        const bottomExDate = formatDateToDMY(actualForm.bottomExamDate || "");
        const bottomSigDate = formatDateToDMY(actualForm.bottomSignatureDate || "");

        const values = {
          serialNumber: actualForm.serialNumber || "",
          workerName: actualForm.name || patient.name || "",
          fatherHusbandName: actualForm.fatherHusbandName || patient.fatherName || "",
          gender: actualForm.sex || patient.gender || "",
          residenceLine1: resLine1,
          residenceLine2: resLine2,
          pinCode: actualForm.pinCode || "",
          city: actualForm.city || "",
          state: actualForm.state || "",
          dob: formatDateToDMY(actualForm.dateOfBirth || patient.dob || ""),
          factoryName: actualForm.factoryName || patient.company || "",
          
          // Hazardous process binary choice
          hazardousYes: actualForm.hazardousProcess === "Yes" ? "Yes" : "",
          hazardousNo: actualForm.hazardousProcess === "Yes" ? " " : "",
          hazardousArea: actualForm.hazardousArea || "NA",

          // Dangerous operation binary choice
          dangerousYes: actualForm.dangerousOperation === "Yes" ? "Yes" : "",
          dangerousNo: actualForm.dangerousOperation === "Yes" ? " " : "",
          dangerousArea: actualForm.dangerousArea || "NA",

          identificationMarks: actualForm.identificationMarks || patient.identificationMarks || "",
          examinedAge: actualForm.examinedAge || patient.age || "",
          unfitReason: actualForm.fitStatus === "UNFIT" ? (actualForm.unfitReason || "") : "NA",
          previousCertificate: actualForm.previousCertificate || "NA",
          
          pronounHisHer1: pronounHisHer,
          pronounHeShe1: pronounHeShe,
          certificateDateTime: certDateTime,

          patientSignature: patient.signature || "",
          doctorSignature: patient.signature || "", // Medical Officer signature

          // Bottom table re-examinations
          bottomExamDate: bottomExDate,
          bottomUnfitPeriod: actualForm.extensionNote || "NA",
          bottomSymptoms: actualForm.symptoms || "Fit For Joining",
          bottomSignatureDate: bottomSigDate
        };

        const response = await api.post(`/forms/fill/form33`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_Form_33_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate Form 33 PDF:", err);
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
          <Link to={`/patients/${patientId}/form-33`} className="button-secondary">Back to Form</Link>
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
                Form No. 33 PDF Document (Stamped)
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
