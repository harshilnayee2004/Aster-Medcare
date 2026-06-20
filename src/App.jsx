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
import XRayReportForm from "./pages/XRayReportForm.jsx";
import XRayReportTemplate from "./pages/XRayReportTemplate.jsx";
import FullReportTemplate from "./pages/FullReportTemplate.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Analytics from "./pages/Analytics.jsx";
import BulkImport from "./pages/BulkImport.jsx";
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
      
      <Route path="/patients/:patientId/full-report/preview" element={
        <ProtectedRoute>
          <FullReportTemplate />
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
