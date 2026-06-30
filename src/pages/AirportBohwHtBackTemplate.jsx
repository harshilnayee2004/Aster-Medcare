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

export default function AirportBohwHtBackTemplate({ hideActions = false, patient: propPatient }) {
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
        const actualForm = forms["36-form-airport-bohw-ht-back"]?.data || {};

        // Parse date formatting YYYY-MM-DD to DD/MM/YYYY
        let dateStr = "";
        const dateVal = actualForm.date || "";
        if (dateVal) {
          const parts = dateVal.split("-");
          if (parts.length === 3) {
            dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            dateStr = dateVal;
          }
        }

        // Stamping mapping
        const values = {
          date: dateStr,
          name: actualForm.name || patient.name || "",
          age: actualForm.age || patient.age || "",
          sex: actualForm.sex || patient.gender || "",
          mobileNo: actualForm.mobileNo || patient.mobile || "",
          companyName: actualForm.companyName || patient.company || "Aster Medcare",
          idNo: actualForm.idNo || patient.patientId || "",
          previousHistory: actualForm.previousHistory || "",
          beforePulseRate: actualForm.beforePulseRate || "",
          beforeBp: actualForm.beforeBp || "",
          afterPulseRate: actualForm.afterPulseRate || "",
          afterBp: actualForm.afterBp || "",
          uncontrolledThoughts: actualForm.uncontrolledThoughts || "NO",
          uncontrolledThoughtsRemark: actualForm.uncontrolledThoughtsRemark || "",
          fearLosingControl: actualForm.fearLosingControl || "NO",
          fearLosingControlRemark: actualForm.fearLosingControlRemark || "",
          fearFainting: actualForm.fearFainting || "NO",
          fearFaintingRemark: actualForm.fearFaintingRemark || "",
          intenseFeelingComeDown: actualForm.intenseFeelingComeDown || "NO",
          intenseFeelingComeDownRemark: actualForm.intenseFeelingComeDownRemark || "",
          worryUpcomingEvents: actualForm.worryUpcomingEvents || "NO",
          worryUpcomingEventsRemark: actualForm.worryUpcomingEventsRemark || "",
          palpitation: actualForm.palpitation || "NO",
          palpitationRemark: actualForm.palpitationRemark || "",
          dizziness: actualForm.dizziness || "NO",
          dizzinessRemark: actualForm.dizzinessRemark || "",
          chestPain: actualForm.chestPain || "NO",
          chestPainRemark: actualForm.chestPainRemark || "",
          shivering: actualForm.shivering || "NO",
          shiveringRemark: actualForm.shiveringRemark || "",
          feelingChoking: actualForm.feelingChoking || "NO",
          feelingChokingRemark: actualForm.feelingChokingRemark || "",
          sweating: actualForm.sweating || "NO",
          sweatingRemark: actualForm.sweatingRemark || "",
          nausea: actualForm.nausea || "NO",
          nauseaRemark: actualForm.nauseaRemark || "",
          numbnessTugging: actualForm.numbnessTugging || "NO",
          numbnessTuggingRemark: actualForm.numbnessTuggingRemark || "",
          flushes: actualForm.flushes || "NO",
          flushesRemark: actualForm.flushesRemark || "",
          flatFoot: actualForm.flatFoot || "NO",
          flatFootRemark: actualForm.flatFootRemark || "",
          fitStatus: actualForm.fitStatus === "FIT" ? "YES" : "NO",
          remark: actualForm.remark || "",
          criteriaMajorIllness: actualForm.criteriaMajorIllness || "NO",
          criteriaMajorIllnessRemark: actualForm.criteriaMajorIllnessRemark || "",
          criteriaEpilepsy: actualForm.criteriaEpilepsy || "NO",
          criteriaEpilepsyRemark: actualForm.criteriaEpilepsyRemark || "",
          criteriaVision: actualForm.criteriaVision || "NO",
          criteriaVisionRemark: actualForm.criteriaVisionRemark || "",
          criteriaAuditory: actualForm.criteriaAuditory || "NO",
          criteriaAuditoryRemark: actualForm.criteriaAuditoryRemark || "",
          criteriaLocomotor: actualForm.criteriaLocomotor || "NO",
          criteriaLocomotorRemark: actualForm.criteriaLocomotorRemark || "",
          criteriaBreathing: actualForm.criteriaBreathing || "YES",
          criteriaBreathingRemark: actualForm.criteriaBreathingRemark || "",
          criteriaUpperLimbs: actualForm.criteriaUpperLimbs || "YES",
          criteriaUpperLimbsRemark: actualForm.criteriaUpperLimbsRemark || "",
          criteriaLowerLimbs: actualForm.criteriaLowerLimbs || "YES",
          criteriaLowerLimbsRemark: actualForm.criteriaLowerLimbsRemark || "",
          criteriaStability: actualForm.criteriaStability || "YES",
          criteriaStabilityRemark: actualForm.criteriaStabilityRemark || "",
          criteriaAnyOtherText: actualForm.criteriaAnyOtherText || "",
          criteriaAnyOther: actualForm.criteriaAnyOther || "NO",
          criteriaAnyOtherRemark: actualForm.criteriaAnyOtherRemark || "",
          certifiedName: actualForm.certifiedName || patient.name || "",
          fitWorkAt: actualForm.fitWorkAt || "",
          doctorName: actualForm.doctorName || "",
          doctorRegistration: actualForm.doctorRegistration || "",
          patientSignature: patient.signature || ""
        };

        const response = await api.post(`/forms/fill/36-form-airport-bohw-ht-back`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_36_FORM_Airport_BOHW_HT_Back_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate Airport BOHW-HT Back PDF:", err);
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
          <Link to={`/patients/${patientId}/airport-bohw-ht-back`} className="button-secondary">Back to Form</Link>
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
