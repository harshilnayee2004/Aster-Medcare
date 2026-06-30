import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getPatient } from "../utils/localStorage.js";
import api from "../services/api";

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

export default function AirportBohwHtFrontTemplate({ hideActions = false, patient: propPatient }) {
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
        const actualForm = forms["35-form-airport-bohw-ht-front"]?.data || {};

        // Parse DOB formatting YYYY-MM-DD to DD/MM/YYYY
        let dobStr = "";
        const dobVal = actualForm.dob || patient.dob || "";
        if (dobVal) {
          const parts = dobVal.split("-");
          if (parts.length === 3) {
            dobStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            dobStr = dobVal;
          }
        }

        let dateTopStr = "";
        const dateTopVal = actualForm.dateTop || "";
        if (dateTopVal) {
          const parts = dateTopVal.split("-");
          if (parts.length === 3) {
            dateTopStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            dateTopStr = dateTopVal;
          }
        }

        // Stamping mapping
        const values = {
          certificateSerialNo: actualForm.certificateSerialNo || "",
          dateTop: dateTopStr,
          name: actualForm.name || patient.name || "",
          identificationMarks: actualForm.identificationMarks || "",
          fatherName: actualForm.fatherName || patient.fatherName || "",
          sex: actualForm.sex || patient.gender || "",
          mobileNo: actualForm.mobileNo || patient.mobile || "",
          residence: actualForm.residence || patient.address || "",
          dob: dobStr,
          aadharNo: actualForm.aadharNo || patient.aadharNo || "",
          height: actualForm.height || "",
          weight: actualForm.weight || "",
          bloodPressure: actualForm.bloodPressure || "",
          pulse: actualForm.pulse || "",
          hearing: actualForm.hearing || "",
          refractiveError: actualForm.refractiveError || "",
          colourVision: actualForm.colourVision || "",
          anyDisability: actualForm.anyDisability || "",
          armFunctionGrip: actualForm.armFunctionGrip || "",
          legFootFunction: actualForm.legFootFunction || "",
          varicose: actualForm.varicose || "NO",
          seizure: actualForm.seizure || "NO",
          vertigo: actualForm.vertigo || "NO",
          acrophobia: actualForm.acrophobia || "NO",
          diabetes: actualForm.diabetes || "NO",
          stroke: actualForm.stroke || "NO",
          heartDiseases: actualForm.heartDiseases || "NO",
          majorIllnessOrSurgery: actualForm.majorIllnessOrSurgery || "NO",
          symptomsVisible: actualForm.symptomsVisible || "NO",
          othersIfAny: actualForm.othersIfAny || "",
          residingAt: actualForm.residingAt || "",
          fitForEmploymentIn: actualForm.fitForEmploymentIn || "",
          ascertainedAge: actualForm.ascertainedAge || "",
          fitStatus: actualForm.fitStatus || "FIT",
          reasonRefusal: actualForm.reasonRefusal || "",
          reasonRevoked: actualForm.reasonRevoked || "",
          companyName: actualForm.companyName || patient.company || "Aster Medcare",
          patientSignature: patient.signature || ""
        };

        const response = await api.post(`/forms/fill/35-form-airport-bohw-ht-front`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_35_FORM_Airport_BOHW_HT_Front_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate Airport BOHW-HT Front PDF:", err);
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
          <Link to={`/patients/${patientId}/airport-bohw-ht-front`} className="button-secondary">Back to Form</Link>
          <button onClick={handleDownload} className="button-secondary bg-white text-slate-700 hover:text-brand">Download PDF</button>
          <button onClick={handlePrint} className="button-primary">Print PDF</button>
        </div>
      )}

      {loadingPdf ? (
        <div className="text-center py-20 text-slate-500 font-medium">Generating stamped PDF...</div>
      ) : pdfUrl ? (
        <div className="template-container">
          <div className={hideActions ? "print-content max-w-[800px] mx-auto" : "print-content shadow-lg border border-line rounded-lg overflow-hidden bg-white max-w-[800px] mx-auto print:shadow-none print:border-none print:rounded-none print:max-w-none print:p-0"}>
            {pages.map((pageNum) => (
              <PdfPage key={pageNum} pdfUrl={pdfUrl} pageNum={pageNum} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-red-500 font-semibold">Failed to load PDF template.</div>
      )}
    </main>
  );
}
