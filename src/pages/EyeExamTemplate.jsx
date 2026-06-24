import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, getPatient } from "../utils/localStorage.js";

export default function EyeExamTemplate({ hideActions = false, patient: propPatient }) {
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
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Eye Exam Report...</div>;
  }

  if (!patient) return <Navigate to="/patients" replace />;

  const forms = patient.forms || {};
  const form = forms.eyeExam?.data || {};
  const savedAt = forms.eyeExam?.savedAt;
  const date = savedAt ? formatDate(savedAt) : formatDate();

  return (
    <main className={hideActions ? "" : "template-screen"}>
      {!hideActions && (
        <div className="template-actions">
          <Link to={`/patients/${patientId}/eye-exam`} className="button-secondary">Back to Form</Link>
          <button onClick={() => window.print()} className="button-primary">Print</button>
        </div>
      )}

      <div className="eye-page">
        <div className="eye-form-title">Ophthalmological Examination Report (Front)</div>

        <div className="flex justify-between items-baseline mb-3 text-sm">
          <div className="flex items-baseline gap-1.5 flex-grow max-w-[400px]">
            <span className="shrink-0 font-bold">Data Collected By :</span>
            <span className="border-b border-black flex-grow text-center min-w-[150px] pb-0.5">{form.collectedBy}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="shrink-0 font-bold">DATE:</span>
            <span className="border-b border-black text-center min-w-[100px] px-2 pb-0.5">{date}</span>
          </div>
        </div>

        <table className="eye-info">
          <tbody>
            <tr>
              <td style={{ width: "38%", verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Name :-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.name || patient.name}</span>
                </div>
              </td>
              <td style={{ width: "24%", verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Age:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[30px] pb-0.5">{form.age || patient.age}</span>
                  <span className="shrink-0">Year</span>
                </div>
              </td>
              <td style={{ width: "38%", verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Gender:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.gender || patient.gender}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Occupation:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[150px] pb-0.5">{form.occupation}</span>
                </div>
              </td>
              <td style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Allergy:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[100px] pb-0.5">{form.allergy}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Past Ophthalmic History:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[80px] pb-0.5">{form.pastHistory}</span>
                </div>
              </td>
              <td colSpan="2" style={{ verticalAlign: "middle" }}>
                <div className="flex items-baseline gap-1.5 w-full">
                  <span className="font-bold shrink-0">Any Ophthalmic Complain Now:-</span>
                  <span className="border-b border-black flex-grow text-center min-w-[120px] pb-0.5">{form.currentComplaint}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="eye-section-bar">EYE Check-UP Report</div>

        <div className="eye-subheading">Ocular Finding During External Clinical Appearance:-</div>

        {[
          ["Eyeballs", "Symmetrical in size and position, and in the same plane as the eyebrow and maxilla"],
          ["Eyelids", "Fit smoothly against the eyeball, and cover approximately the same amount of it"],
          ["Conjunctiva", "Equally white in both eyes"],
          ["Iris", "Flat and varies in color"],
          ["Cornea", "Translucent, smooth, and avascular"],
          ["Sclera", "White and surrounds the iris and pupil"],
        ].map(([label, desc]) => (
          <div className="eye-bullet-row" key={label}><span className="eye-bul">&bull;</span><span className="eye-lbl">{label}</span><span className="eye-sep">:-</span><span className="eye-desc">{desc}</span></div>
        ))}

        <table className="eye-params">
          <tbody>
            <tr>
              <th className="eye-col-param">Parameters</th>
              <th className="eye-col-eye">Right EYE</th>
              <th className="eye-col-eye">Left EYE</th>
            </tr>
            <Row label="1. Distant Vision (Snellen Test):- With / Without Glasses" right={form.distantRight} left={form.distantLeft} />
            <Row label="2. Near Vision:- With / Without Glasses" right={form.nearRight} left={form.nearLeft} />
            <tr>
              <td className="eye-col-param">3. Color Vision (Ishihara Chart)</td>
              <td className="eye-col-eye" colSpan="2">{form.colorVision}</td>
            </tr>
            <Row label="4. Power of Glasses / Contact Lenses (If Any)" right={form.powerRight} left={form.powerLeft} />
            <Row label="5. Pupil" right={form.pupilRight} left={form.pupilLeft} />
            <Row label="6. Retina (Direct Ophthalmoscopy Examination)" right={form.retinaRight} left={form.retinaLeft} />
            <CheckRow label="1. Visual Acuity:- [6/6 or 20/20] or better on each eye?" right={form.visualAcuityRight} left={form.visualAcuityLeft} />
            <CheckRow label="2. Any History / Evidence of Impaired Night Vision?" right={form.nightVisionRight} left={form.nightVisionLeft} />
            <CheckRow label="3. Is there any Defect in color vision? If yes What Kind of defect of color?" right={form.colorDefectRight} left={form.colorDefectLeft} />
            <CheckRow label="4. Is there any sign of Diplopia?" right={form.diplopiaRight} left={form.diplopiaLeft} />
            <CheckRow label="5. Is there any evidence of other ophthalmic pathological condition or diabetes since last examination? If yes, what condition:" right={form.pathologyRight} left={form.pathologyLeft} />
          </tbody>
        </table>

        <table className="eye-titmus">
          <tbody>
            <tr>
              <td colSpan="3">Specific Titmus For:- Drivers / Security / Canteen Staff</td>
              <td><strong>REMARKS (If Any)</strong></td>
            </tr>
            {["Squint", "Binocularity", "Stereo Depth", "Peripheral Vision", "Muscle Strength"].map((item, index) => (
              <tr key={item}>
                <td className="eye-num-col">{index + 1}</td>
                <td className="eye-item-col">{item}</td>
                <td className="eye-status-col">{index === 0 ? "Present / Absent" : "Normal / Abnormal"}</td>
                <td className="eye-remarks-col">{form.remarks || "NA"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-baseline gap-1.5 w-full mt-4 text-sm">
          <span className="font-bold shrink-0">Conclusion</span>
          <span className="shrink-0 font-bold">:-</span>
          <span className="border-b border-black flex-grow text-center min-w-[200px] pb-0.5">{form.conclusion}</span>
        </div>

        <div className="flex items-baseline gap-1.5 w-full mt-3 text-sm">
          <span className="font-bold shrink-0">Remarks (If Any):-</span>
          <span className="border-b border-black flex-grow text-center min-w-[200px] pb-0.5">{form.remarks}</span>
        </div>
        <div className="eye-remarks-extra"></div>

        <div className="eye-signature-block">
          <div className="eye-sig-line"></div>
          <div className="eye-sig-label">Sign of Doctor with stamp</div>
          <div className="eye-sig-date flex items-baseline gap-1.5 justify-end">
            <span className="shrink-0">DATE:-</span>
            <span className="border-b border-black text-center min-w-[100px] px-2 pb-0.5">{date}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, right, left }) {
  return (
    <tr>
      <td className="eye-col-param">{label}</td>
      <td className="eye-col-eye">{right}</td>
      <td className="eye-col-eye">{left}</td>
    </tr>
  );
}

function CheckRow({ label, right, left }) {
  return (
    <tr>
      <td className="eye-col-param">{label}</td>
      <td className="eye-col-eye eye-yn">{mark(right, "YES")}YES / {mark(right, "NO")}NO</td>
      <td className="eye-col-eye eye-yn">{mark(left, "YES")}YES / {mark(left, "NO")}NO</td>
    </tr>
  );
}

function mark(value, expected) {
  return <span className={`eye-checkbox ${value === expected ? "eye-checked" : ""}`}></span>;
}
