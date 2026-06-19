import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, getPatient } from "../utils/localStorage.js";
import { postMedicalTests } from "./PostMedicalForm.jsx";

function certDateParts(value) {
  if (!value) return ["", "", "", "", "", ""];
  const d = new Date(value);
  if (isNaN(d.getTime())) return ["", "", "", "", "", ""];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, '0');
  return [day, month, year, hourStr, minutes, ampm];
}

export default function PostMedicalTemplate({ hideActions = false }) {
  const { patientId } = useParams();
  const patient = getPatient(patientId);

  if (!patient) return <Navigate to="/patients" replace />;

  const form = patient.postMedical || {};
  const reportDate = form.savedAt ? formatDate(form.savedAt).replaceAll("/", " / ") : formatDate().replaceAll("/", " / ");
  const [day, month, year, hour, minute, ampm] = certDateParts(form.certificateDate || form.savedAt);

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && <TemplateActions backTo={`/patients/${patientId}/post-medical`} />}
      <div className="post-page">
        <div className="post-form-title">POST MEDICAL CHECK-UP / Remarks / Summery / Evaluation FORM (Part-2)</div>

        <div className="post-eval-date">Report Evaluation Date:- {reportDate}</div>

        <div className="post-intro-text">- Review of All Examination and Evaluation Report for following test whichever is applicable and tick (&radic;) the respective results.</div>

        <table className="post-table">
          <tbody>
            <tr className="post-table-header-row">
              <td colSpan="3">Doctor Observations</td>
            </tr>
            <tr>
              <th className="post-test-col">Test</th>
              <th className="post-center-col">Normal</th>
              <th className="post-center-col">Abnormal (Write Finding if any)</th>
            </tr>
            {postMedicalTests.map(([key, label]) => (
              <tr key={key}>
                <td className="post-test-col">{label}</td>
                <td className="post-center-col">{form[key] === "YES" ? "YES" : "NO"}</td>
                <td className="post-center-col">{form[key] === "YES" ? "NO" : "YES"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="post-table-note">(Above Observation Additional remarks with treatment / Suitable action recommended Below )</div>

        <div className="post-treatment-heading">Treatment &amp; Recommendation</div>

        <div className="post-dotted-line"><span className="post-label">Rx</span> {form.treatmentRecommendation}</div>
        <div className="post-dotted-line"></div>
        <div className="post-no-medication">{form.treatmentRecommendation || "No Any Medication Requirement...!!!"}</div>
        <div className="post-dotted-line"></div>
        <div className="post-dotted-line"></div>

        <div className="post-cert-heading">Certificate from Doctor:-</div>

        <div className="post-twsic">TO WHOMSOEVER IT MAY CONCERN</div>

        <div className="post-cert-body">
          I Certify that I have reviewed the all above mark Report of <span className="post-filled-blank">{patient.name}</span> and I found of that the reports are Normal / Abnormal, and the person Requires/Not Requires Any additional investigation as per above advise and medical treatment related attention&nbsp;&nbsp;Required, this person is Temporary / Permanent <strong>{form.fitStatus || "FIT"}</strong> for Employment Till <span className="post-filled-blank">{form.employmentTill || "\u00a0"}</span> (Upcoming Annual / Biannual your health checkup program date) in the above -stated Your occupation. Thanking you.
        </div>

        <div className="post-date-row">
          <span>DATE:</span>
          <span className="post-filled-blank post-short">{day}</span><span>/</span>
          <span className="post-filled-blank post-short">{month}</span><span>/20</span>
          <span className="post-filled-blank post-short">{year}</span>&nbsp;&nbsp;
          <span className="post-filled-blank post-short">{hour}</span><span>:</span>
          <span className="post-filled-blank post-short">{minute}</span>&nbsp;
          <span className="post-filled-blank post-short">{ampm}</span>
        </div>

        <div className="post-sign-label">Sign of Doctor with Stamp</div>

        <div className="post-footer-note">
          Note:- Medically Unfit person may be refused to returned to work or will be advised for treatment before resume the duties. Kindly take all medication as per advised by our doctor. As per best of my knowledge This Worker can work (as above given advise) in a factory and if You have any query regarding all reports&nbsp;&nbsp;kindly recheck and revaluate &amp; correlate clinically and interpret / Evaluated by other specialist consultant doctor also and take second opinion also and take advice according to them and give work to factory (According to factory act laws) according to that. This Report is not useful for medico legal Purpose.
        </div>
      </div>
    </main>
  );
}

function TemplateActions({ backTo }) {
  return (
    <div className="template-actions">
      <Link to={backTo} className="button-secondary">Back to Form</Link>
      <button onClick={() => window.print()} className="button-primary">Print</button>
    </div>
  );
}
