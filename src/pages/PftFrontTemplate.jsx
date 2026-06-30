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

export default function PftFrontTemplate({ hideActions = false, patient: propPatient }) {
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
        const actualForm = forms["13-form-pft-front"]?.data || {};

        // Parse YES / NO choices
        const cough = String(actualForm.dailyCough || "No").toUpperCase();
        const sobVal = String(actualForm.sob || "No").toUpperCase();
        const apnea = String(actualForm.sleepApnea || "No").toUpperCase();
        const surg = String(actualForm.surgery || "No").toUpperCase();
        const rad = String(actualForm.radChemo || "No").toUpperCase();
        const exp = String(actualForm.exposure || "No").toUpperCase();
        const prev = String(actualForm.prevTest || "No").toUpperCase();
        const smoke = String(actualForm.everSmoked || "No").toUpperCase();
        const contra = String(actualForm.contraBronchodilator || "No").toUpperCase();
        const ecg = String(actualForm.recentEcg || "Not Done").toUpperCase();
        const family = String(actualForm.familyHistoryPet || "No").toUpperCase();

        const values = {
          dataCollectedBy: actualForm.dataCollectedBy || "",
          formNo: actualForm.formNo || "",
          date: formatDateToDMY(actualForm.date || ""),
          patientName: actualForm.patientName || patient.name || "",
          age: actualForm.age || (patient.age ? String(patient.age) : ""),
          gender: actualForm.gender || patient.gender || "",
          address: actualForm.address || patient.address || "",
          city: actualForm.city || patient.city || "",
          state: actualForm.state || patient.state || "",
          pinCode: actualForm.pinCode || patient.pinCode || "",
          mobileNo: actualForm.mobileNo || patient.mobile || "",
          company: actualForm.company || patient.company || "",
          occupationPost: actualForm.occupationPost || patient.occupation || "",
          allergicHistory: actualForm.allergicHistory || "No Allergy",
          
          // Test Required
          testPre: actualForm.testPre ? "√" : "",
          testPost: actualForm.testPost ? "√" : "",
          testLungVolume: actualForm.testLungVolume ? "√" : "",
          testCardio: actualForm.testCardio ? "√" : "",
          testBronchial: actualForm.testBronchial ? "√" : "",
          
          // Questionnaire
          diagnosisDetails: actualForm.diagnosis === "Other" ? (actualForm.diagnosisDetails || "") : actualForm.diagnosis || "",
          dailyCoughYes: cough === "YES" ? "√" : "",
          dailyCoughNo: cough === "YES" ? " " : "√",
          
          // Medical History checklist: Tick if true, space (covering with white) if false
          histAsthma: actualForm.histAsthma ? "√" : " ",
          histEmphysema: actualForm.histEmphysema ? "√" : " ",
          histPneumonia: actualForm.histPneumonia ? "√" : " ",
          histAngina: actualForm.histAngina ? "√" : " ",
          histHeartDisease: actualForm.histHeartDisease ? "√" : " ",
          histWheezing: actualForm.histWheezing ? "√" : " ",
          histTuberculosis: actualForm.histTuberculosis ? "√" : " ",
          histBronchiectasis: actualForm.histBronchiectasis ? "√" : " ",
          histBronchitis: actualForm.histBronchitis ? "√" : " ",
          
          // SOB
          sobYes: sobVal === "YES" ? "√" : "",
          sobNo: sobVal === "YES" ? " " : "√",
          sobSitting: sobVal === "YES" && actualForm.sobType === "Sitting" ? "√" : " ",
          sobWalking: sobVal === "YES" && actualForm.sobType === "Walking" ? "√" : " ",
          sobClimbing: sobVal === "YES" && actualForm.sobType === "Climbing Stairs" ? "√" : " ",
          
          xrayFindings: actualForm.xrayFindings || "",
          sleepApneaYes: apnea === "YES" ? "√" : "",
          sleepApneaNo: apnea === "YES" ? " " : "√",
          reasonForTest: actualForm.reasonForTest || "",
          
          // Surgery
          surgeryYes: surg === "YES" ? "√" : "",
          surgeryNo: surg === "YES" ? " " : "√",
          surgeryAreaCover: " ", // Always cover this area with white
          
          // Radiation/Chemo
          radYes: rad === "YES" ? "√" : "",
          radNo: rad === "YES" ? " " : "√",
          radMedicationArea: rad === "YES" ? `${actualForm.radMedication || ""}, ${actualForm.radArea || ""}` : "",
          
          // Exposure
          exposureYes: exp === "YES" ? "√" : "",
          exposureNo: exp === "YES" ? " " : "√",
          exposureAreaCover: exp === "YES" ? " " : "",
          exposureDetails: exp === "YES" ? (actualForm.exposureDetails || "") : "",
          
          // Previous Test
          prevTestText: prev === "YES" ? "YES" : "NO",
          prevTestDetails: prev === "YES" ? (actualForm.prevTestDetails || "") : "",
          
          // Clinical Info
          clinDyspnea: actualForm.clinDyspnea ? "√" : " ",
          clinHeartFailure: actualForm.clinHeartFailure ? "√" : " ",
          clinCyanosis: actualForm.clinCyanosis ? "√" : " ",
          clinAngina: actualForm.clinAngina ? "√" : " ",
          clinOther: actualForm.clinOther ? "√" : " ",
          clinOtherDetails: actualForm.clinOther ? (actualForm.clinOtherDetails || "") : " ",
          
          // Current Treatment
          treatBronchodilators: actualForm.treatBronchodilators ? "√" : " ",
          treatSteroids: actualForm.treatSteroids ? "√" : " ",
          treatBetaBlockers: actualForm.treatBetaBlockers ? "√" : " ",
          treatAntihypertensive: actualForm.treatAntihypertensive ? "√" : " ",
          treatOther: actualForm.treatOther ? "√" : " ",
          treatOtherDetails: actualForm.treatOther ? (actualForm.treatOtherDetails || "") : " ",
          
          // Smoking
          smokeYes: smoke === "YES" ? "√" : "",
          smokeNo: smoke === "YES" ? " " : "√",
          smokeType: smoke === "YES" ? (actualForm.smokeType || "Cigarettes") : " ",
          smokePacksPerDay: smoke === "YES" ? (actualForm.smokePacksPerDay || "") : " ",
          smokeQuitDate: smoke === "YES" ? (actualForm.smokeQuitDate || "") : " ",
          
          // Contra
          contraYes: contra === "YES" ? "√" : "",
          contraNo: contra === "YES" ? " " : "√",
          
          // ECG
          ecgNormal: ecg === "NORMAL" ? "√" : " ",
          ecgAbnormal: ecg === "ABNORMAL" ? "√" : " ",
          ecgNotDone: ecg === "NOT DONE" ? "√" : " ",
          ecgDate: ecg !== "NOT DONE" ? formatDateToDMY(actualForm.ecgDate || "") : " ",
          
          // Family
          familyYes: family === "YES" ? "√" : "",
          familyNo: family === "YES" ? " " : "√",
          familyPetName: family === "YES" ? (actualForm.familyPetName || "") : " ",
          familySince: family === "YES" ? (actualForm.familySince || "") : " ",
          
          // Doctor Signature & Date
          doctorDate: formatDateToDMY(actualForm.doctorDate || ""),
          doctorSignature: patient.signature || "",
          doctorStamp: actualForm.doctorStamp || ""
        };

        const response = await api.post(`/forms/fill/13-form-pft-front`, { values }, {
          responseType: "blob"
        });

        const outputFilename = `filled_PFT_Front_${patient.patientId}.pdf`;

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setDownloadFilename(outputFilename);
      } catch (err) {
        console.error("Failed to generate PFT Front PDF:", err);
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
          <Link to={`/patients/${patientId}/pft-front`} className="button-secondary">Back to Form</Link>
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
                PFT Front PDF Document (Stamped)
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
