import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, getPatient } from "../utils/localStorage.js";

function displayDate(value) {
  return value ? formatDate(value) : "";
}

export default function HealthRegisterTemplate({ hideActions = false, patient: propPatient }) {
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
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Health Register Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  const forms = patient.forms || {};
  const form = forms.healthRegister?.data || {};
  const savedAt = forms.healthRegister?.savedAt;

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions">
          <Link to={`/patients/${patientId}/health-register`} className="button-secondary">Back to Form</Link>
          <button onClick={() => window.print()} className="button-primary">Print</button>
        </div>
      )}

      <div className="form32-page">
        <div className="form32-hdr">
          <div className="form32-t1">FORM NO. 32</div>
          <div className="form32-t2">(Prescribed under Rule 68-T and 102)</div>
          <div className="form32-t3">Health Register</div>
        </div>

        <div className="form32-pi">
          <div className="form32-pr">
            <span className="form32-lb">1.&nbsp;&nbsp; Serial Number in the Register of adult Workers</span>
            <span className="form32-vl">&nbsp;:- {form.serialNumber}</span>
          </div>
          <div className="form32-pr">
            <span className="form32-lb">2.&nbsp;&nbsp; Name of Worker</span>
            <span className="form32-vl">&nbsp;:- {form.name || patient.name}</span>
          </div>
          <div className="form32-pr">
            <span className="form32-lb">3.&nbsp;&nbsp; Sex</span>
            <span className="form32-vl">&nbsp;:- {form.sex || patient.gender}</span>
          </div>
          <div className="form32-pr">
            <span className="form32-lb">4.&nbsp;&nbsp; Date of birth</span>
            <span className="form32-vl">&nbsp;:- {displayDate(form.dateOfBirth)}</span>
          </div>
        </div>

        <table className="form32-table">
          <colgroup>
            <col style={{ width: "26px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "165px" }} />
            <col />
          </colgroup>
          <tbody>
            {/* ROW 1 */}
            <tr>
              <td className="form32-ctr">1</td>
              <td>Department Works</td>
              <td className="form32-bold form32-ctr" colSpan="2">{form.departmentWorks}</td>
            </tr>
            {/* ROW 2 */}
            <tr>
              <td className="form32-ctr">2</td>
              <td>Name of Hazardous process</td>
              <td className="form32-ctr" colSpan="2">{form.hazardousProcessName}</td>
            </tr>
            {/* ROW 3 */}
            <tr>
              <td className="form32-ctr">3</td>
              <td>Dangerous process/operation</td>
              <td className="form32-ctr" colSpan="2">{form.dangerousOperation}</td>
            </tr>
            {/* ROW 4 */}
            <tr>
              <td className="form32-ctr">4</td>
              <td>Nature of job or occupation</td>
              <td className="form32-ctr" colSpan="2">{form.jobNature}</td>
            </tr>
            {/* ROW 5 */}
            <tr>
              <td className="form32-ctr">5</td>
              <td>Raw materials, products or By-products likely to be exposed to</td>
              <td className="form32-ctr" colSpan="2">{form.rawMaterialsExposed}</td>
            </tr>
            {/* ROW 6 */}
            <tr style={{ height: "32px" }}>
              <td className="form32-ctr">6</td>
              <td>Date of posting</td>
              <td colSpan="2" className="form32-ctr">{displayDate(form.dateOfPosting)}</td>
            </tr>
            {/* ROW 7 */}
            <tr style={{ height: "32px" }}>
              <td className="form32-ctr">7</td>
              <td>Date of leaving/transfer to or transfer</td>
              <td colSpan="2" className="form32-ctr">{displayDate(form.dateOfLeaving)}</td>
            </tr>
            {/* ROW 8 */}
            <tr style={{ height: "32px" }}>
              <td className="form32-ctr">8</td>
              <td>Reasons for Discharge/ leaving or transfer</td>
              <td colSpan="2" className="form32-ctr">{form.reasonsForLeaving}</td>
            </tr>

            {/* ROW 9 */}
            <tr>
              <td rowSpan="4" style={{ borderRight: "1px solid #000" }}></td>
              <td></td>
              <td>Date</td>
              <td className="form32-ctr">{displayDate(form.examinationDate || savedAt)}</td>
            </tr>

            {/* ROW 10 */}
            <tr style={{ height: "46px" }}>
              <td className="form32-mid" rowSpan="3">Medical examination</td>
              <td>Signs and symptoms Observed during examination</td>
              <td className="form32-ctr">{form.signsSymptoms}</td>
            </tr>

            {/* ROW 11 */}
            <tr>
              <td>Nature of tests</td>
              <td style={{ fontSize: "9.5px" }}>{form.natureOfTests}</td>
            </tr>

            {/* ROW 12 */}
            <tr>
              <td>Result</td>
              <td className="form32-ctr form32-bold">{form.result}</td>
            </tr>

            {/* ROW 13 */}
            <tr style={{ height: "44px" }}>
              <td className="form32-ctr">13</td>
              <td className="form32-ctr form32-mid" rowSpan="4">If declared unfit for Work</td>
              <td>Period of temporary Withdrawal from that work</td>
              <td className="form32-ctr">{form.withdrawalPeriod}</td>
            </tr>

            {/* ROW 14 */}
            <tr style={{ height: "33px" }}>
              <td className="form32-ctr">14</td>
              <td>Reasons for such withdrawal</td>
              <td className="form32-ctr">{form.withdrawalReason}</td>
            </tr>

            {/* ROW 15 */}
            <tr style={{ height: "36px" }}>
              <td className="form32-ctr">15</td>
              <td>Date of declaring him/her Unfit for that work</td>
              <td className="form32-ctr">{displayDate(form.dateDeclaredUnfit)}</td>
            </tr>

            {/* ROW 16 */}
            <tr style={{ height: "33px" }}>
              <td className="form32-ctr">16</td>
              <td>Date of issuing fitness Certificate</td>
              <td className="form32-ctr">{displayDate(form.dateFitnessCertificateIssued)}</td>
            </tr>

            {/* ROW 17 */}
            <tr style={{ height: "88px" }}>
              <td className="form32-ctr form32-mid">17</td>
              <td className="form32-mid">Signature with date of the factory Medical Officer/ the Certifying Surgeon.</td>
              <td className="form32-ctr form32-bot relative" colSpan="2">
                <div className="flex flex-col items-center justify-center h-full min-h-[70px]">
                  <img 
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/forms/doctor-signature`} 
                    alt="Doctor Signature" 
                    className="h-12 object-contain" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <div className="text-[10px] mt-1">{displayDate(form.doctorSignatureDate || savedAt)}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="form32-note">
          <p>Note : 1. Separate page should be maintained for individual worker.</p>
          <p style={{ paddingLeft: "43px" }}>2. Fresh entry should be made for each examination.</p>
        </div>
      </div>
    </main>
  );
}
