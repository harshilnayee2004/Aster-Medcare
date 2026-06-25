import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getPatient } from "../utils/localStorage.js";
import api from "../services/api";

function dateParts(value) {
  if (!value) return ["", "", ""];
  const parts = value.split("-");
  if (parts.length === 3) {
    return [parts[2], parts[1], parts[0]];
  }
  return ["", "", ""];
}

function datetimeParts(value) {
  if (!value) return ["", "", "", "", "", ""];
  const d = new Date(value);
  if (isNaN(d.getTime())) return ["", "", "", "", "", ""];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, '0');
  return [day, month, year, hourStr, minutes, ampm];
}

function calculateAge(dobString) {
  if (!dobString) return "";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return String(age);
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

export default function PreMedicalTemplate({ hideActions = false, patient: propPatient }) {
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
        const actualForm = forms.preMedical?.data || {};

        // Parse date and time separately
        const [day, month, year, hourStr, minutes, ampm] = datetimeParts(actualForm.dateTime || "");
        const dateStr = day ? `${day}/${month}/${year}` : "";
        const timeStr = hourStr ? `${hourStr}:${minutes} ${ampm}` : "";

        // Format DOB cleanly as DD/MM/YYYY
        const [dobDay, dobMonth, dobYear] = dateParts(actualForm.dob || patient.dob || "");
        const dobStr = dobDay ? `${dobDay}/${dobMonth}/${dobYear}` : "";
        
        // Calculate age automatically from DOB, or fallback to saved age
        const computedAge = calculateAge(actualForm.dob || patient.dob || "") || String(actualForm.age || patient.age || "");

        // Stamping mapping
        const values = {
          collectedBy: actualForm.collectedBy || "",
          formNo: actualForm.formNo || "",
          date: dateStr,
          time: timeStr,
          name: actualForm.name || patient.name || "",
          address: actualForm.address || patient.address || "",
          city: actualForm.city || "",
          state: actualForm.state || "",
          pinNo: actualForm.pinNo || "",
          emailId: actualForm.emailId || "",
          phoneNo: actualForm.phoneNo || patient.mobile || "",
          gender: actualForm.gender || patient.gender || "",
          dob: dobStr,
          age: computedAge,
          govtIdProof: actualForm.govtIdProof || "",
          govtIdProofNo: actualForm.govtIdProofNo || "",
          occupation: actualForm.occupation || "",
          occupationName: actualForm.occupationName || "",
          occupationId: actualForm.occupationId || "",
          bloodGroup: actualForm.bloodGroup || "",
          post: actualForm.post || "",
          
          // Diseases
          asthma: actualForm.asthma || "NO",
          tb: actualForm.tb || "NO",
          fits: actualForm.fits || "NO",
          mental: actualForm.mental || "NO",
          eyeDisease: actualForm.eyeDisease || "NO",
          heartDisease: actualForm.heartDisease || "NO",
          skinDisease: actualForm.skinDisease || "NO",
          injuryFracture: actualForm.injuryFracture || "NO",
          surgery: actualForm.surgery || "NO",
          infectiousDisease: actualForm.infectiousDisease || "NO",
          
          // Personal Details
          diet: actualForm.diet || "",
          allergy: actualForm.allergy || "NO",
          addiction: actualForm.addiction || "NO",
          addictionQty: actualForm.addictionQty || "",
          otherIllness: actualForm.otherIllness || "NO",
          familyBp: actualForm.familyBp ? "YES" : "NO",
          familyDiabetes: actualForm.familyDiabetes ? "YES" : "NO",
          familyHeart: actualForm.familyHeart ? "YES" : "NO",
          familyCancer: actualForm.familyCancer ? "YES" : "NO",
          
          identificationMark: actualForm.identificationMark || "",
          otherDetails: actualForm.otherDetails || "NA",
          signature: patient.signature || "",
          verifiedBy: actualForm.verifiedBy || "",
          verifiedDateTime: actualForm.verifiedDateTime || ""
        };

        const response = await api.post(`/forms/fill/1-form-personal-details`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_1_FORM_Personal_Details_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate Pre-Medical PDF:", err);
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
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Pre Medical Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions print:hidden">
          <Link to={`/patients/${patientId}/pre-medical`} className="button-secondary">Back to Form</Link>
          <button onClick={handleDownload} className="button-secondary bg-white text-slate-700 hover:text-brand">Download PDF</button>
          <button onClick={handlePrint} className="button-primary">Print PDF</button>
        </div>
      )}

      {loadingPdf ? (
        <div className="max-w-[800px] mx-auto bg-white p-20 rounded-xl border border-line text-center text-slate-400 font-semibold shadow-soft print:hidden">
          Stamping data onto original PDF template...
        </div>
      ) : pdfUrl ? (
        <div className="mx-auto max-w-[800px] bg-white border border-line rounded-xl shadow-soft p-5 space-y-4 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
          {hideActions && (
            <div className="flex items-center justify-between border-b border-line pb-3 print:hidden">
              <h3 className="text-sm font-bold text-slate-800">
                Pre-Medical PDF Document (Stamped)
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
          Failed to load Pre-Medical PDF template. Please check configuration.
        </div>
      )}
    </main>
  );
}
