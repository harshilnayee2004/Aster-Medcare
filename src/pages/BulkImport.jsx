import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import AppShell from "../components/AppShell.jsx";
import api from "../services/api";

export default function BulkImport() {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleDownloadTemplate() {
    try {
      const templateData = [
        {
          "Worker Name": "Amit Kumar",
          "Age": 28,
          "Gender": "Male",
          "Mobile": "9876543210",
          "Company": "Reliance Industries",
          "Address": "GIDC Lodhika, Rajkot, Gujarat",
          "Father Name": "Ramesh Kumar",
          "Designation": "Machine Operator"
        },
        {
          "Worker Name": "Sunita Devi",
          "Age": 32,
          "Gender": "Female",
          "Mobile": "9876543211",
          "Company": "Tata Motors",
          "Address": "GIDC Metoda, Rajkot, Gujarat",
          "Father Name": "Suresh Prasad",
          "Designation": "Quality Inspector"
        }
      ];

      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Workers Template");
      XLSX.writeFile(wb, "Aster_Medcare_Workers_Template.xlsx");
      setSuccess("Sample template downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate Excel template:", err);
      setError("Failed to download template. Please try again.");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert spreadsheet rows to JSON
        const rawRows = XLSX.utils.sheet_to_json(sheet);
        if (rawRows.length === 0) {
          throw new Error("The selected spreadsheet appears to be empty.");
        }

        // Map column headers dynamically to Mongoose schema attributes
        const mapped = rawRows.map((row) => ({
          name: String(row.Name || row.name || row["Worker Name"] || row["Patient Name"] || "").trim(),
          age: Number(row.Age || row.age || row["Patient Age"] || 0),
          gender: String(row.Gender || row.gender || "Male").trim(),
          mobile: String(row.Mobile || row.mobile || row["Mobile Number"] || row["MobileNo"] || "").trim(),
          company: String(row.Company || row.company || row["Company Name"] || "").trim(),
          address: String(row.Address || row.address || "").trim(),
          fatherName: String(row.FatherName || row["Father Name"] || row["Father's Name"] || row.fatherName || "").trim(),
          occupation: String(row.Occupation || row.occupation || row.Designation || row.designation || "").trim()
        }));

        // Filter out empty rows (where name is missing)
        const validRows = mapped.filter((r) => r.name);
        if (validRows.length === 0) {
          throw new Error("No valid records found. Make sure columns contain a 'Name' header.");
        }

        setPreviewData(validRows);
      } catch (err) {
        console.error("Excel parsing failed:", err);
        setError(err.message || "Failed to parse Excel sheet. Ensure it is a valid .xlsx file.");
        setPreviewData([]);
        setFileName("");
      }
    };

    reader.readAsBinaryString(file);
  }

  async function handleConfirmImport() {
    if (previewData.length === 0) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/patients/bulk", previewData);
      setSuccess(res.data.message || `Successfully imported ${res.data.count} patients!`);
      setPreviewData([]);
      setFileName("");
      
      // Navigate to patient selection after 2 seconds
      setTimeout(() => {
        navigate("/patients");
      }, 2000);
    } catch (err) {
      console.error("Bulk upload failed:", err);
      setError(err.response?.data?.message || "Failed to save records in database. Please check connection.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Excel Bulk Patient Import</h1>
            <p className="mt-1 text-sm text-slate-500">Register hundreds of workers instantly by uploading a spreadsheet template.</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-brand transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Excel Template</span>
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 font-semibold">
            {success}
          </div>
        )}

        {/* Upload Zone */}
        <section className="bg-white rounded-xl border border-line p-6 sm:p-8 shadow-soft space-y-5">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Step 1 — Upload Worker Sheet</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="button-primary flex items-center justify-center gap-2 cursor-pointer min-w-[180px] text-center">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Choose Excel File</span>
              <input
                type="file"
                accept=".xlsx"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {fileName && (
              <div className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
                Selected: <span className="text-brand font-mono">{fileName}</span>
              </div>
            )}
            {!fileName && (
              <p className="text-xs text-slate-400 italic">Supports standard spreadsheet (.xlsx) formats. Requires Name, Age, and Gender columns.</p>
            )}
          </div>
        </section>

        {/* Preview Data Grid */}
        {previewData.length > 0 && (
          <section className="bg-white rounded-xl border border-line p-6 sm:p-8 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Step 2 — Preview Parsed Records ({previewData.length})</h2>
                <p className="mt-1 text-xs text-slate-400">Ensure the columns have matched correctly before committing to the database.</p>
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={uploading}
                className="button-primary flex items-center justify-center gap-2 px-6"
              >
                {uploading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {uploading ? "Saving Records..." : "Confirm & Import All"}
              </button>
            </div>

            <div className="overflow-hidden border border-line rounded-xl max-h-[360px] overflow-y-auto bg-white">
              <table className="min-w-full divide-y divide-line text-sm text-left">
                <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-6 py-3 bg-slate-50">Worker Name</th>
                    <th className="px-6 py-3 bg-slate-50">Age</th>
                    <th className="px-6 py-3 bg-slate-50">Gender</th>
                    <th className="px-6 py-3 bg-slate-50">Mobile</th>
                    <th className="px-6 py-3 bg-slate-50">Company</th>
                    <th className="px-6 py-3 bg-slate-50">Father's Name</th>
                    <th className="px-6 py-3 bg-slate-50">Occupation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-3 font-semibold text-slate-800">{row.name}</td>
                      <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.age}</td>
                      <td className="px-6 py-3 text-slate-600">{row.gender}</td>
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs">{row.mobile || "—"}</td>
                      <td className="px-6 py-3 text-slate-500">{row.company || "Aster Medcare"}</td>
                      <td className="px-6 py-3 text-slate-500">{row.fatherName || "—"}</td>
                      <td className="px-6 py-3 text-slate-500">{row.occupation || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
