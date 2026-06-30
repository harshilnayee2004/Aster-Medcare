import { useEffect, useState } from "react";
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

export default function Form33Template({ hideActions = false, patient: propPatient }) {
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
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Form 33 Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  const forms = patient.forms || {};
  const form = forms.form33?.data || {};
  const savedAt = forms.form33?.savedAt;

  const exam = dateParts(form.examinationDate || savedAt);
  const doctor = dateParts(form.doctorSignatureDate || savedAt);
  const [docDay, docMonth, docYear, docHour, docMinute, docAmpm] = datetimeParts(form.doctorSignatureDate || savedAt);

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
        <FieldRow num="3." label="Father's / Husband Name" value={form.fatherHusbandName || patient.fatherName} />
        <FieldRow num="4." label="Sex" value={form.sex || patient.gender} />
        <FieldRow num="5." label="Residence with Pin code" value={form.residence || patient.address} />

        <div className="flex items-baseline mb-2 text-sm">
          <span className="w-6 shrink-0"></span>
          <span className="w-56 shrink-0"></span>
          <span className="w-4 shrink-0"></span>
          <div className="flex items-baseline gap-1.5 flex-grow">
            <span className="border-b border-black flex-grow text-center min-w-[150px] pb-0.5">{form.residence || patient.address}</span>
            <span className="shrink-0">Pin Code:-</span>
            <span className="border-b border-black text-center min-w-[80px] pb-0.5">{form.pinCode}</span>
          </div>
        </div>
        <div className="flex items-baseline mb-2 text-sm">
          <span className="w-6 shrink-0"></span>
          <span className="w-56 shrink-0"></span>
          <span className="w-4 shrink-0"></span>
          <div className="flex items-baseline gap-1.5 flex-grow">
            <span className="shrink-0">City:-</span>
            <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.city}</span>
            <span className="shrink-0">State:-</span>
            <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.state}</span>
          </div>
        </div>

        <FieldRow num="6." label="Date of birth, if available" value={displayDate(form.dateOfBirth)} />
        <FieldRow num="7." label="Name & address of the factory" value={[form.factoryName || patient.company, form.factoryAddress].filter(Boolean).join(", ")} />

        <div className="flex items-baseline mb-2 text-sm">
          <span className="w-6 shrink-0 font-bold">8.</span>
          <span className="shrink-0 font-bold">The worker is employed/proposed in</span>
        </div>

        <div className="flex items-baseline mb-2 text-sm ml-6">
          <span className="w-52 shrink-0">(a) Hazardous process</span>
          <div className="flex items-baseline gap-1.5 flex-grow">
            <span className="shrink-0">:- {form.hazardousProcess || "No"}</span>
            <span className="shrink-0 ml-4">Area Name:-</span>
            <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.hazardousArea}</span>
          </div>
        </div>
        <div className="flex items-baseline mb-2 text-sm ml-6">
          <span className="w-52 shrink-0">(b) Dangerous operation</span>
          <div className="flex items-baseline gap-1.5 flex-grow">
            <span className="shrink-0">:- {form.dangerousOperation || "No"}</span>
            <span className="shrink-0 ml-4">Area Name:-</span>
            <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.dangerousArea}</span>
          </div>
        </div>

        <div className="my-4 text-sm leading-relaxed text-left">
          <p className="mb-2">
            I certify that I have personally examined the above named person whose identification marks are{" "}
            <span className="inline-block border-b border-black text-center min-w-[150px] px-2 pb-0.5">{form.identificationMarks || patient.identificationMarks}</span>{" "}
            and who is desirous of being employed in{" "}
            <span className="inline-block border-b border-black text-center min-w-[150px] px-2 pb-0.5">{form.employedIn}</span>.
          </p>
          <p className="mb-2">
            Above mentioned process/operation and that his/her, age, as can be ascertained from my examination, is{" "}
            <span className="inline-block border-b border-black text-center min-w-[60px] px-2 pb-0.5">{form.examinedAge || patient.age}</span> years.
          </p>
          <p className="mb-2">
            In my opinion he / she is <span className="font-bold underline">{form.fitStatus === "UNFIT" ? "unfit" : "fit"}</span> for employment in the Said manufacturing process/operation.
          </p>
        </div>

        <div className="flex items-stretch border border-black my-4 text-sm">
          <div className="w-20 border-r border-black flex items-center justify-center text-center font-bold px-2 py-3">
            For<br />UNFIT
          </div>
          <div className="flex-1 p-3 space-y-2 text-left leading-relaxed">
            <p>
              In my opinion he / she is unfit for employment in the said manufacturing process/operation for the reason{" "}
              <span className="inline-block border-b border-black text-center min-w-[150px] px-2 pb-0.5">{form.unfitReason || "NA"}</span>{" "}
              he/she is referred for further examination to the Certifying Surgeon.
            </p>
            <p>
              The serial number of previous certificate is{" "}
              <span className="inline-block border-b border-black text-center min-w-[150px] px-2 pb-0.5">{form.previousCertificate || "NA"}</span>.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-start mt-6 text-sm">
          <div className="w-[45%] text-left space-y-3">
            <div className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-bold">X</div>
            <div className="text-xs leading-tight text-slate-700">
              Signature or left-hand thumb<br />impression of the person examined
            </div>
            <div className="flex items-baseline gap-1.5 w-full">
              <span className="shrink-0">Name of the Factory :</span>
              <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.factoryName || patient.company}</span>
            </div>
          </div>
          <div className="w-[45%] text-right space-y-3">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="shrink-0">DATE:</span>
              <span className="border-b border-black text-center min-w-[30px] pb-0.5">{docDay}</span>/
              <span className="border-b border-black text-center min-w-[30px] pb-0.5">{docMonth}</span>/20
              <span className="border-b border-black text-center min-w-[30px] pb-0.5">{docYear}</span>&nbsp;&nbsp;
              <span className="border-b border-black text-center min-w-[35px] pb-0.5">{docHour}</span>:
              <span className="border-b border-black text-center min-w-[35px] pb-0.5">{docMinute}</span>
              <span className="border-b border-black text-center min-w-[40px] pb-0.5">{docAmpm}</span>
            </div>
            <div className="flex flex-col items-center justify-end h-[50px] relative">
              <img 
                src={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/forms/doctor-signature`} 
                alt="Doctor Signature" 
                className="h-12 object-contain absolute bottom-0 right-[40px]" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>
            <div className="pt-1 font-semibold">Signature of the Factory Medical Officer</div>
            <div className="text-xs text-slate-500">Stamp of factory Medical Officer</div>
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
              <td style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline justify-center gap-1">
                  <span>DATE:-</span>
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{exam[0]}</span>/
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{exam[1]}</span>/20
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{exam[2]}</span>
                </div>
              </td>
              <td>{form.extensionNote}</td>
              <td>{form.symptoms}</td>
              <td style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline justify-center gap-1">
                  <span>DATE:-</span>
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{doctor[0]}</span>/
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{doctor[1]}</span>/20
                  <span className="border-b border-black text-center min-w-[24px] pb-0.5">{doctor[2]}</span>
                </div>
              </td>
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
    <div className="flex items-baseline mb-2 text-sm">
      <span className="w-6 shrink-0 font-bold">{num}</span>
      <span className="w-56 shrink-0">{label}</span>
      <span className="w-4 shrink-0">:-</span>
      <span className="border-b border-black flex-grow text-center min-w-[150px] pb-0.5">{value}</span>
    </div>
  );
}
