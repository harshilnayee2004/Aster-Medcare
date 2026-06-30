import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";

export default function PdfFiller() {
  const [searchParams] = useSearchParams();
  const formIdQuery = searchParams.get("formId");
  const patientIdQuery = searchParams.get("patientId");

  const [formsList, setFormsList] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingFields, setFetchingFields] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Preview states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState("");

  // Load registered forms on mount
  useEffect(() => {
    async function loadForms() {
      try {
        setError("");
        const res = await api.get("/forms");
        setFormsList(res.data || []);
        if (res.data && res.data.length > 0) {
          const defaultSelect = formIdQuery && res.data.some(f => f.safeId === formIdQuery)
            ? formIdQuery
            : res.data[0].safeId;
          setSelectedFormId(defaultSelect);
        }
      } catch (err) {
        console.error("Failed to load forms list:", err);
        setError("Failed to fetch forms registry from server.");
      }
    }
    loadForms();
  }, [formIdQuery]);

  // Fetch coordinate fields when selected form changes
  useEffect(() => {
    if (!selectedFormId) {
      setFields([]);
      setValues({});
      return;
    }

    async function loadFields() {
      try {
        setFetchingFields(true);
        setError("");
        setSuccess("");
        const res = await api.get(`/forms/${selectedFormId}/coordinates`);
        const formFields = res.data?.fields || [];
        setFields(formFields);
        
        // Initialize values object
        const initialValues = {};
        formFields.forEach(f => {
          initialValues[f] = "";
        });

        if (patientIdQuery) {
          try {
            const patientRes = await api.get(`/patients/${patientIdQuery}`);
            const patient = patientRes.data;
            if (patient) {
              const forms = patient.forms || {};
              const preMed = forms.preMedical?.data || {};
              const postMed = forms.postMedical?.data || {};
              const eyeExam = forms.eyeExam?.data || {};
              const savedFormData = forms[selectedFormId]?.data || {};

              // Parse DOB formatting
              let dobStr = "";
              if (patient.dob) {
                const parts = patient.dob.split("-");
                if (parts.length === 3) {
                  dobStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
              }

              // Auto-fill mapping
              formFields.forEach(f => {
                if (savedFormData[f] !== undefined && savedFormData[f] !== "") {
                  initialValues[f] = savedFormData[f];
                } else {
                  if (f === "name" || f === "patientName" || f === "patient_name") {
                    initialValues[f] = patient.name || "";
                  } else if (f === "fatherName") {
                    initialValues[f] = patient.fatherName || "";
                  } else if (f === "sex" || f === "gender") {
                    initialValues[f] = patient.gender || "";
                  } else if (f === "mobileNo" || f === "phoneNo" || f === "mobile") {
                    initialValues[f] = patient.mobile || "";
                  } else if (f === "residence" || f === "address") {
                    initialValues[f] = patient.address || "";
                  } else if (f === "residingAt") {
                    initialValues[f] = patient.address || "";
                  } else if (f === "dob" || f === "dateOfBirth") {
                    initialValues[f] = dobStr || "";
                  } else if (f === "companyName" || f === "company") {
                    initialValues[f] = patient.company || "Aster Medcare";
                  } else if (f === "aadharNo") {
                    initialValues[f] = patient.aadharNo || (preMed.govtIdProof?.toLowerCase().includes("aadhar") ? preMed.govtIdProofNo : "");
                  } else if (f === "height") {
                    initialValues[f] = String(preMed.height || postMed.height || "");
                  } else if (f === "weight") {
                    initialValues[f] = String(preMed.weight || postMed.weight || "");
                  } else if (f === "bloodPressure" || f === "bp") {
                    initialValues[f] = preMed.bp || postMed.bp || "";
                  } else if (f === "pulse") {
                    initialValues[f] = String(preMed.pulse || postMed.pulse || "");
                  } else if (f === "hearing") {
                    initialValues[f] = preMed.hearing || "Normal";
                  } else if (f === "refractiveError") {
                    initialValues[f] = eyeExam.refractiveError || "";
                  } else if (f === "colourVision") {
                    initialValues[f] = eyeExam.colourVision || "Normal";
                  } else if (f === "anyDisability") {
                    initialValues[f] = preMed.disability || "None";
                  } else if (f === "identificationMarks") {
                    initialValues[f] = preMed.identificationMark || "";
                  } else if (f === "patientSignature" || f === "signature") {
                    initialValues[f] = patient.signature || "";
                  } else if (f === "ascertainedAge") {
                    initialValues[f] = String(patient.age || "");
                  } else if (f === "fitStatus") {
                    initialValues[f] = postMed.fitStatus || "FIT";
                  }
                }
              });
            }
          } catch (err) {
            console.error("Failed to load patient for pre-population:", err);
          }
        }

        setValues(initialValues);
      } catch (err) {
        console.error("Failed to load fields for form:", err);
        setError("Failed to load coordinate fields for the selected form.");
      } finally {
        setFetchingFields(false);
      }
    }
    loadFields();
  }, [selectedFormId, patientIdQuery]);

  // Reset preview when form selection or inputs change to prevent outdated views
  useEffect(() => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSuccess("");
    }
  }, [selectedFormId, values]);

  const handleInputChange = (field, val) => {
    setValues(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleGeneratePreview = async (e) => {
    e.preventDefault();
    if (!selectedFormId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // POST to fill endpoint with responseType blob
      const response = await api.post(`/forms/fill/${selectedFormId}`, { values }, {
        responseType: "blob"
      });

      // Find original filename from registry
      const selectedForm = formsList.find(f => f.safeId === selectedFormId);
      const outputFilename = selectedForm 
        ? `filled_${selectedForm.pdfFile}` 
        : `filled_${selectedFormId}.pdf`;

      // Generate Blob URL for preview
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setDownloadFilename(outputFilename);
      setSuccess("PDF preview successfully generated! Check it on the right.");
    } catch (err) {
      console.error("Failed to generate PDF preview:", err);
      setError("Failed to generate PDF preview. Please verify values and server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    if (!selectedFormId || !patientIdQuery) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/patients/${patientIdQuery}/forms/${selectedFormId}`, { data: values });
      setSuccess("Form data successfully saved under patient's record!");
    } catch (err) {
      console.error("Failed to save form data:", err);
      setError("Failed to save form data to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = downloadFilename || "filled_form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format field name to clean labels (e.g. "fatherName" -> "Father Name")
  const formatLabel = (field) => {
    return field
      .replace(/([A-Z])/g, " $1") // insert space before capital letters
      .replace(/^./, str => str.toUpperCase()) // capitalize first letter
      .trim();
  };

  return (
    <AppShell patientId={patientIdQuery}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive PDF Form Filler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a PDF template form, fill in the coordinate fields, preview the output, and download the stamped document.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}

        {/* Two column grid layout for inputs and preview side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Inputs Form */}
          <div className="lg:col-span-5 bg-white border border-line rounded-xl shadow-soft p-6 space-y-6">
            <form onSubmit={handleGeneratePreview} className="space-y-6">
              <div>
                <label htmlFor="form-select" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select PDF Form Template
                </label>
                <select
                  id="form-select"
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-line rounded-lg text-sm font-medium focus:border-brand focus:outline-none transition shadow-sm"
                >
                  {formsList.length === 0 ? (
                    <option value="">No forms found</option>
                  ) : (
                    formsList.map((form) => (
                      <option key={form.safeId} value={form.safeId}>
                        {form.displayName} ({form.pdfFile})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {fetchingFields ? (
                <div className="text-center py-8 text-slate-400 text-sm font-semibold animate-pulse">
                  Fetching fields configuration...
                </div>
              ) : fields.length > 0 ? (
                <div className="space-y-5 border-t border-line pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Form Fields (Stamping Coordinates Loaded)
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-5">
                    {fields.map((field) => (
                      <div key={field}>
                        <label htmlFor={`input-${field}`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {formatLabel(field)}
                        </label>
                        <input
                          id={`input-${field}`}
                          type="text"
                          value={values[field] || ""}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          placeholder={`Enter ${formatLabel(field)}`}
                          required
                          className="w-full h-11 px-3 border border-line rounded-lg text-sm focus:border-brand focus:outline-none transition shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedFormId ? (
                <div className="border-t border-line pt-6 text-center py-6">
                  <p className="text-sm font-medium text-slate-400 italic">
                    This form currently has no coordinate stubs configured.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add coordinate mappings to <code>config/form-coordinates/{selectedFormId}.json</code> to display inputs.
                  </p>
                </div>
              ) : null}

              {fields.length > 0 && (
                <div className="border-t border-line pt-5 flex flex-col sm:flex-row gap-4">
                  {patientIdQuery && (
                    <button
                      type="button"
                      disabled={saving || loading}
                      onClick={handleSaveData}
                      className="bg-brand hover:bg-blue-600 text-white flex-1 h-11 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving Data...
                        </>
                      ) : (
                        "Save Form Data"
                      )}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || saving}
                    className="button-primary flex-1 h-11 text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating Preview...
                      </>
                    ) : (
                      "Generate Preview"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Panel: Live PDF Preview & Download Button */}
          <div className="lg:col-span-7 space-y-4">
            {previewUrl ? (
              <div className="bg-white border border-line rounded-xl shadow-soft p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Live PDF Document Preview
                  </h3>
                  <button
                    onClick={handleDownload}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Filled PDF
                  </button>
                </div>
                
                {/* PDF rendering iframe */}
                <div className="border border-line rounded-lg overflow-hidden bg-slate-100 flex-1 h-[900px]">
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&view=Fit`}
                    className="w-full h-full"
                    title="Filled PDF Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl h-[975px] flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-white">
                <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-semibold text-sm">No Preview Generated Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Fill in the coordinate input fields on the left and click "Generate Preview" to visualize your stamped document here.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
