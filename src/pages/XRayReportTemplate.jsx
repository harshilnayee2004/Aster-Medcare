import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, getPatient } from "../utils/localStorage.js";

export default function XRayReportTemplate({ hideActions = false, patient: propPatient }) {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(propPatient || null);
  const [loading, setLoading] = useState(!propPatient);

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

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading X-Ray Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  const forms = patient.forms || {};
  const form = forms.xrayReport?.data || {};
  const savedAt = forms.xrayReport?.savedAt;
  const date = savedAt ? formatDate(savedAt) : formatDate();

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions">
          <Link to={`/patients/${patientId}/xray-report`} className="button-secondary">Back to Form</Link>
          <button onClick={() => window.print()} className="button-primary">Print</button>
        </div>
      )}

      <div className="xray-page">
        <div className="xray-title">X-Ray Report - 1</div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "12px" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold", width: "25%" }}>Patient ID</td>
              <td style={{ border: "1px solid #000", padding: "8px", width: "25%" }}>{patient.patientId}</td>
              <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold", width: "25%" }}>Date</td>
              <td style={{ border: "1px solid #000", padding: "8px", width: "25%" }}>{date}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Name</td>
              <td style={{ border: "1px solid #000", padding: "8px" }} colSpan="3">{patient.name}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Age / Gender</td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>{patient.age} Yrs / {patient.gender}</td>
              <td style={{ border: "1px solid #000", padding: "8px", fontWeight: "bold" }}>Company</td>
              <td style={{ border: "1px solid #000", padding: "8px" }}>{patient.company || "Aster Medcare"}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "15px", width: "100%", borderBottom: "1px solid #000", paddingBottom: "6px" }}>
            CHEST X-RAY IMAGE:
          </div>
          {form.photo ? (
            <div style={{ display: "flex", justifyContent: "center", width: "100%", background: "#000", padding: "10px", borderRadius: "4px", border: "1px solid #000" }}>
              <img src={form.photo} alt="Patient Chest X-Ray" style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{ padding: "40px", fontStyle: "italic", color: "#666", textAlign: "center", border: "1px dashed #ccc", width: "100%", borderRadius: "4px" }}>
              No X-Ray image uploaded yet.
            </div>
          )}
        </div>

        <div style={{ marginTop: "80px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <div>
            <div style={{ borderBottom: "1px solid #000", width: "150px", height: "30px" }}></div>
            <p style={{ marginTop: "4px" }}>Technician Signature</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ borderBottom: "1px solid #000", width: "150px", height: "30px", marginLeft: "auto" }}></div>
            <p style={{ marginTop: "4px" }}>Radiologist Signature & Stamp</p>
          </div>
        </div>
      </div>
    </main>
  );
}
