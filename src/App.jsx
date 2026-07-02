import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
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
import PreMedicalForm from "./pages/PreMedicalForm.jsx";
import PreMedicalTemplate from "./pages/PreMedicalTemplate.jsx";
import XRayReportForm from "./pages/XRayReportForm.jsx";
import XRayReportTemplate from "./pages/XRayReportTemplate.jsx";
import FullReportTemplate from "./pages/FullReportTemplate.jsx";
import AirportBohwForm from "./pages/AirportBohwForm.jsx";
import AirportBohwTemplate from "./pages/AirportBohwTemplate.jsx";
import AirportBohwHtFrontForm from "./pages/AirportBohwHtFrontForm.jsx";
import AirportBohwHtFrontTemplate from "./pages/AirportBohwHtFrontTemplate.jsx";
import AirportBohwHtBackForm from "./pages/AirportBohwHtBackForm.jsx";
import AirportBohwHtBackTemplate from "./pages/AirportBohwHtBackTemplate.jsx";
import FoodHandlerForm from "./pages/FoodHandlerForm.jsx";
import FoodHandlerTemplate from "./pages/FoodHandlerTemplate.jsx";
import VaccinationFrontForm from "./pages/VaccinationFrontForm.jsx";
import VaccinationFrontTemplate from "./pages/VaccinationFrontTemplate.jsx";
import VaccinationBackForm from "./pages/VaccinationBackForm.jsx";
import VaccinationBackTemplate from "./pages/VaccinationBackTemplate.jsx";
import PftFrontForm from "./pages/PftFrontForm.jsx";
import PftFrontTemplate from "./pages/PftFrontTemplate.jsx";
import PftBackForm from "./pages/PftBackForm.jsx";
import PftBackTemplate from "./pages/PftBackTemplate.jsx";
import EcgForm from "./pages/EcgForm.jsx";
import EcgTemplate from "./pages/EcgTemplate.jsx";
import HeightPassForm from "./pages/HeightPassForm.jsx";
import HeightPassTemplate from "./pages/HeightPassTemplate.jsx";
import OphthalForm6Form from "./pages/OphthalForm6Form.jsx";
import OphthalForm6Template from "./pages/OphthalForm6Template.jsx";
import AudiometryFrontForm from "./pages/AudiometryFrontForm.jsx";
import AudiometryFrontTemplate from "./pages/AudiometryFrontTemplate.jsx";
import AudiometryBackForm from "./pages/AudiometryBackForm.jsx";
import AudiometryBackTemplate from "./pages/AudiometryBackTemplate.jsx";
import VaccineCertificateForm from "./pages/VaccineCertificateForm.jsx";
import VaccineCertificateTemplate from "./pages/VaccineCertificateTemplate.jsx";
import FitnessCertificateForm from "./pages/FitnessCertificateForm.jsx";
import FitnessCertificateTemplate from "./pages/FitnessCertificateTemplate.jsx";
import DeathCertificateForm from "./pages/DeathCertificateForm.jsx";
import DeathCertificateTemplate from "./pages/DeathCertificateTemplate.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Analytics from "./pages/Analytics.jsx";
import BulkImport from "./pages/BulkImport.jsx";
import PdfFiller from "./pages/PdfFiller.jsx";
import NotFound from "./pages/NotFound.jsx";

// Route protection wrapper for authenticated users
function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9fc] text-slate-500 font-semibold">
        Loading Authentication Session...
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Route protection wrapper for specific user roles
function RoleProtectedRoute({ children, allowedRoles }) {
  const { currentUser, token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9fc] text-slate-500 font-semibold">
        Loading Authentication Session...
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/patients" replace />;
  }
  
  return children;
}

// Route protection wrapper for form pages based on currentUser.formAccess
function FormProtectedRoute({ children, formKey }) {
  const { currentUser, token, loading } = useAuth();
  const { patientId } = useParams();
  
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f9fc] text-slate-500 font-semibold">
        Loading Authentication Session...
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  if (!currentUser) {
    return <Navigate to="/patients" replace />;
  }

  // Admins and Doctors always have full access to all forms
  if (currentUser.role === "admin" || currentUser.role === "doctor") {
    return children;
  }

  // Employees must have the formKey in their formAccess array
  if (currentUser.role === "employee" && currentUser.formAccess?.includes(formKey)) {
    return children;
  }

  // Access denied, redirect to patient dashboard or directory
  return <Navigate to={patientId ? `/patients/${patientId}` : "/patients"} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Authenticated Routes */}
      <Route path="/patients" element={
        <ProtectedRoute>
          <PatientSelection />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/new" element={
        <ProtectedRoute>
          <PatientRegistration />
        </ProtectedRoute>
      } />

      <Route path="/import" element={
        <ProtectedRoute>
          <BulkImport />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/pre-medical" element={
        <FormProtectedRoute formKey="preMedical">
          <PreMedicalForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/pre-medical/preview" element={
        <FormProtectedRoute formKey="preMedical">
          <PreMedicalTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/post-medical" element={
        <FormProtectedRoute formKey="postMedical">
          <PostMedicalForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/post-medical/preview" element={
        <FormProtectedRoute formKey="postMedical">
          <PostMedicalTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/eye-exam" element={
        <FormProtectedRoute formKey="eyeExam">
          <EyeExamForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/eye-exam/preview" element={
        <FormProtectedRoute formKey="eyeExam">
          <EyeExamTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/form-33" element={
        <FormProtectedRoute formKey="form33">
          <Form33Form />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/form-33/preview" element={
        <FormProtectedRoute formKey="form33">
          <Form33Template />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/health-register" element={
        <FormProtectedRoute formKey="healthRegister">
          <HealthRegisterForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/health-register/preview" element={
        <FormProtectedRoute formKey="healthRegister">
          <HealthRegisterTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/xray-report" element={
        <FormProtectedRoute formKey="xrayReport">
          <XRayReportForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/xray-report/preview" element={
        <FormProtectedRoute formKey="xrayReport">
          <XRayReportTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw" element={
        <FormProtectedRoute formKey="4-form-airport-bohw">
          <AirportBohwForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw/preview" element={
        <FormProtectedRoute formKey="4-form-airport-bohw">
          <AirportBohwTemplate />
        </FormProtectedRoute>
      } />

      <Route path="/patients/:patientId/height-pass" element={
        <FormProtectedRoute formKey="5-form-height-pass">
          <HeightPassForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/height-pass/preview" element={
        <FormProtectedRoute formKey="5-form-height-pass">
          <HeightPassTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw-ht-front" element={
        <FormProtectedRoute formKey="35-form-airport-bohw-ht-front">
          <AirportBohwHtFrontForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw-ht-front/preview" element={
        <FormProtectedRoute formKey="35-form-airport-bohw-ht-front">
          <AirportBohwHtFrontTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw-ht-back" element={
        <FormProtectedRoute formKey="36-form-airport-bohw-ht-back">
          <AirportBohwHtBackForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/airport-bohw-ht-back/preview" element={
        <FormProtectedRoute formKey="36-form-airport-bohw-ht-back">
          <AirportBohwHtBackTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/food-handler" element={
        <FormProtectedRoute formKey="17-form-food-handler-certificate">
          <FoodHandlerForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/food-handler/preview" element={
        <FormProtectedRoute formKey="17-form-food-handler-certificate">
          <FoodHandlerTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccination-front" element={
        <FormProtectedRoute formKey="15-form-vaccination-front">
          <VaccinationFrontForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccination-front/preview" element={
        <FormProtectedRoute formKey="15-form-vaccination-front">
          <VaccinationFrontTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccination-back" element={
        <FormProtectedRoute formKey="16-form-vaccination-back">
          <VaccinationBackForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccination-back/preview" element={
        <FormProtectedRoute formKey="16-form-vaccination-back">
          <VaccinationBackTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/pft-front" element={
        <FormProtectedRoute formKey="13-form-pft-front">
          <PftFrontForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/pft-front/preview" element={
        <FormProtectedRoute formKey="13-form-pft-front">
          <PftFrontTemplate />
        </FormProtectedRoute>
      } />

      <Route path="/patients/:patientId/pft-back" element={
        <FormProtectedRoute formKey="14-form-pft-back">
          <PftBackForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/pft-back/preview" element={
        <FormProtectedRoute formKey="14-form-pft-back">
          <PftBackTemplate />
        </FormProtectedRoute>
      } />

      <Route path="/patients/:patientId/ecg" element={
        <FormProtectedRoute formKey="19-form-ecg">
          <EcgForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/ecg/preview" element={
        <FormProtectedRoute formKey="19-form-ecg">
          <EcgTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/ophthal-form-6" element={
        <FormProtectedRoute formKey="10-form-ophthal-form-6">
          <OphthalForm6Form />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/ophthal-form-6/preview" element={
        <FormProtectedRoute formKey="10-form-ophthal-form-6">
          <OphthalForm6Template />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/audiometry-front" element={
        <FormProtectedRoute formKey="11-form-audiometry-front">
          <AudiometryFrontForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/audiometry-front/preview" element={
        <FormProtectedRoute formKey="11-form-audiometry-front">
          <AudiometryFrontTemplate />
        </FormProtectedRoute>
      } />

      <Route path="/patients/:patientId/audiometry-back" element={
        <FormProtectedRoute formKey="12-form-audiometry-back">
          <AudiometryBackForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/audiometry-back/preview" element={
        <FormProtectedRoute formKey="12-form-audiometry-back">
          <AudiometryBackTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccine-certificate" element={
        <FormProtectedRoute formKey="18-form-vaccine-ircs-forms-2">
          <VaccineCertificateForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/vaccine-certificate/preview" element={
        <FormProtectedRoute formKey="18-form-vaccine-ircs-forms-2">
          <VaccineCertificateTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/fitness-certificate" element={
        <FormProtectedRoute formKey="25-form-for-medical-fitness-certificate-format">
          <FitnessCertificateForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/fitness-certificate/preview" element={
        <FormProtectedRoute formKey="25-form-for-medical-fitness-certificate-format">
          <FitnessCertificateTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/death-certificate" element={
        <FormProtectedRoute formKey="26-form-death-certificate">
          <DeathCertificateForm />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/death-certificate/preview" element={
        <FormProtectedRoute formKey="26-form-death-certificate">
          <DeathCertificateTemplate />
        </FormProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/full-report/preview" element={
        <ProtectedRoute>
          <FullReportTemplate />
        </ProtectedRoute>
      } />

      <Route path="/pdf-filler" element={
        <ProtectedRoute>
          <PdfFiller />
        </ProtectedRoute>
      } />

      {/* Role Protected Admin & Analytics Routes */}
      <Route path="/admin" element={
        <RoleProtectedRoute allowedRoles={["admin"]}>
          <AdminPanel />
        </RoleProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <RoleProtectedRoute allowedRoles={["admin", "doctor"]}>
          <Analytics />
        </RoleProtectedRoute>
      } />

      {/* Fallback Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
