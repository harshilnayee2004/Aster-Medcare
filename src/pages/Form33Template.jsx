import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, getPatient } from "../utils/localStorage.js";

function displayDate(value) {
  return value ? formatDate(value) : "";
}

function dateParts(value) {
  const formatted = displayDate(value);
  if (!formatted) return ["", "", ""];
  const [day, month, year] = formatted.split("/");
  return [day, month, year?.slice(-2) || ""];
}

function datetimeParts(value) {
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

export default function Form33Template({ hideActions = false }) {
  const { patientId } = useParams();
  const patient = getPatient(patientId);

  if (!patient) return <Navigate to="/patients" replace />;

  const form = patient.form33 || {};
  const exam = dateParts(form.examinationDate || form.savedAt);
  const doctor = dateParts(form.doctorSignatureDate || form.savedAt);
  const [docDay, docMonth, docYear, docHour, docMinute, docAmpm] = datetimeParts(form.doctorSignatureDate || form.savedAt);

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions">
          <Link to={`/patients/${patientId}/form-33`} className="button-secondary">Back to Form</Link>
          <button onClick={() => window.print()} className="button-primary">Print</button>
        </div>
      )}

      <div className="form33-page">
        <div className="form33-form-title">FORM NO. 33</div>

        <div className="form33-subheads">
          <div className="form33-sub1">(Prescribed under Rule 68-T and 102)</div>
          <div className="form33-sub2">Certificate of Fitness of employment in hazardous process and operations.</div>
          <div className="form33-sub3">(TO BE ISSUED BY FACTORY MEDICAL OFFICER)</div>
        </div>

        <FieldRow num="1." label="Serial number in the register of adult workers" value={form.serialNumber} />
        <FieldRow num="2." label="Name of the person examined" value={form.name || patient.name} />
        <FieldRow num="3." label="Father's / Husband Name" value={form.fatherHusbandName} />
        <FieldRow num="4." label="Sex" value={form.sex || patient.gender} />
        <FieldRow num="5." label="Residence with Pin code" value={form.residence || patient.address} />

        <div className="form33-sub-row">
          <span className="form33-ph form33-num"></span><span className="form33-ph form33-label"></span><span className="form33-ph form33-colon"></span>
          <span className="form33-value"><span className="form33-filled form33-mid">{form.residence || patient.address}</span>&nbsp;&nbsp;&nbsp;Pin Code:-<span className="form33-filled form33-short">{form.pinCode}</span></span>
        </div>
        <div className="form33-sub-row">
          <span className="form33-ph form33-num"></span><span className="form33-ph form33-label"></span><span className="form33-ph form33-colon"></span>
          <span className="form33-value">City:-<span className="form33-filled form33-city">{form.city}</span>&nbsp;&nbsp;&nbsp;State:-<span className="form33-filled form33-city">{form.state}</span></span>
        </div>

        <FieldRow num="6." label="Date of birth, if available" value={displayDate(form.dateOfBirth)} />
        <FieldRow num="7." label="Name & address of the factory" value={[form.factoryName || patient.company, form.factoryAddress].filter(Boolean).join(", ")} />

        <div className="form33-field-row">
          <span className="form33-field-num">8.</span>
          <span className="form33-field-label">The worker is employed/proposed in</span>
        </div>

        <div className="form33-sub8"><span className="form33-sub8-label">(a) Hazardous process</span><span className="form33-sub8-rest">:- {form.hazardousProcess || "No"}&nbsp;&nbsp;Area Name:-<span className="form33-filled form33-short">{form.hazardousArea}</span></span></div>
        <div className="form33-sub8"><span className="form33-sub8-label">(b) Dangerous operation</span><span className="form33-sub8-rest">:- {form.dangerousOperation || "No"}&nbsp;&nbsp;Area Name:-<span className="form33-filled form33-short">{form.dangerousArea}</span></span></div>

        <div className="form33-cert-block">
          <p>I certify that I have personally examined the above named person whose identification marks are <span className="form33-filled form33-wide">{form.identificationMarks}</span> and who is desirous of being employed in <span className="form33-filled form33-wide">{form.employedIn}</span>.</p>
          <p>Above mentioned process/operation and that his/her, age, as can be ascertained from my examination, is <span className="form33-filled form33-short">{form.examinedAge || patient.age}</span> years.</p>
          <p>In my opinion he / she is {form.fitStatus === "UNFIT" ? "unfit" : "fit"} for employment in the Said manufacturing process/operation.</p>
        </div>

        <div className="form33-unfit-row">
          <div className="form33-unfit-box">For<br />UNFIT</div>
          <div className="form33-unfit-text">
            <p>In my opinion he / she is unfit for employment in the said manufacturing process/operation for the reason <span className="form33-filled form33-wide">{form.unfitReason}</span> he/she is referred for further examination to the Certifying Surgeon.</p>
            <p>The serial number of previous certificate is <span className="form33-filled form33-wide">{form.previousCertificate}</span> .</p>
          </div>
        </div>

        <div className="form33-sign-section">
          <div className="form33-sign-left">
            <div className="form33-thumb-circle">X</div>
            <div className="form33-sign-caption">Signature or left-hand thumb<br />impression of the person examined</div>
            <div className="form33-factory-line">Name of the Factory : <span className="form33-filled form33-factory">{form.factoryName || patient.company}</span></div>
          </div>
          <div className="form33-sign-right">
            <div>DATE:&nbsp;&nbsp;<span className="form33-filled form33-date-part">{docDay}</span>/<span className="form33-filled form33-date-part">{docMonth}</span>/20<span className="form33-filled form33-date-part">{docYear}</span>&nbsp;&nbsp;<span className="form33-filled form33-date-part">{docHour}</span>:<span className="form33-filled form33-date-part">{docMinute}</span> <span className="form33-filled form33-date-part">{docAmpm}</span></div>
            <div style={{ marginTop: 24 }}>Signature of the Factory Medical Officer</div>
            <div>Stamp of factory Medical Officer</div>
          </div>
        </div>

        <table className="form33-fitness">
          <tbody>
            <tr>
              <th>I certify that I examined the person mentioned above on (date of examination)</th>
              <th>I extend this certificate unfit (if certificate is not extended, the period for which the worker is considered unfit for work is to be mentioned)</th>
              <th>Signs and symptoms observed during examination</th>
              <th>Signature of the Factory medical Officer with date.</th>
            </tr>
            <tr>
              <td>DATE:- <span className="form33-filled form33-date-part">{exam[0]}</span>/<span className="form33-filled form33-date-part">{exam[1]}</span>/20<span className="form33-filled form33-date-part">{exam[2]}</span></td>
              <td>{form.extensionNote}</td>
              <td>{form.symptoms}</td>
              <td>DATE:- <span className="form33-filled form33-date-part">{doctor[0]}</span>/<span className="form33-filled form33-date-part">{doctor[1]}</span>/20<span className="form33-filled form33-date-part">{doctor[2]}</span></td>
            </tr>
          </tbody>
        </table>

        <div className="form33-notes">
          <p>Notes :</p>
          <p>1. If declared unfit, reference should be made immediately to the Certifying Surgeon.</p>
          <p>2. Certifying Surgeon should communicate his findings to the occupier with 30 days of the receipt of this reference.</p>
        </div>
      </div>
    </main>
  );
}

function FieldRow({ num, label, value }) {
  return (
    <div className="form33-field-row">
      <span className="form33-field-num">{num}</span>
      <span className="form33-field-label">{label}</span>
      <span className="form33-field-colon">:-</span>
      <span className="form33-field-value"><span className="form33-filled form33-full">{value}</span></span>
    </div>
  );
}
