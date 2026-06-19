import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import EyeExamForm from "./pages/EyeExamForm.jsx";
import EyeExamTemplate from "./pages/EyeExamTemplate.jsx";
import Form33Form from "./pages/Form33Form.jsx";
import Form33Template from "./pages/Form33Template.jsx";
import HealthRegisterForm from "./pages/HealthRegisterForm.jsx";
import HealthRegisterTemplate from "./pages/HealthRegisterTemplate.jsx";
import Login from "./pages/Login.jsx";
import PatientRegistration from "./pages/PatientRegistration.jsx";
import PatientSelection from "./pages/PatientSelection.jsx";
import PostMedicalForm from "./pages/PostMedicalForm.jsx";
import PostMedicalTemplate from "./pages/PostMedicalTemplate.jsx";
import XRayReportForm from "./pages/XRayReportForm.jsx";
import XRayReportTemplate from "./pages/XRayReportTemplate.jsx";
import FullReportTemplate from "./pages/FullReportTemplate.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/patients" element={<PatientSelection />} />
      <Route path="/patients/new" element={<PatientRegistration />} />
      <Route path="/patients/:patientId" element={<Dashboard />} />
      <Route path="/patients/:patientId/post-medical" element={<PostMedicalForm />} />
      <Route path="/patients/:patientId/post-medical/preview" element={<PostMedicalTemplate />} />
      <Route path="/patients/:patientId/eye-exam" element={<EyeExamForm />} />
      <Route path="/patients/:patientId/eye-exam/preview" element={<EyeExamTemplate />} />
      <Route path="/patients/:patientId/form-33" element={<Form33Form />} />
      <Route path="/patients/:patientId/form-33/preview" element={<Form33Template />} />
      <Route path="/patients/:patientId/health-register" element={<HealthRegisterForm />} />
      <Route path="/patients/:patientId/health-register/preview" element={<HealthRegisterTemplate />} />
      <Route path="/patients/:patientId/xray-report" element={<XRayReportForm />} />
      <Route path="/patients/:patientId/xray-report/preview" element={<XRayReportTemplate />} />
      <Route path="/patients/:patientId/full-report/preview" element={<FullReportTemplate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
