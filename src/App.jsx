import { Navigate, Route, Routes } from "react-router-dom";
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
        <ProtectedRoute>
          <PostMedicalForm />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/post-medical/preview" element={
        <ProtectedRoute>
          <PostMedicalTemplate />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/eye-exam" element={
        <ProtectedRoute>
          <EyeExamForm />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/eye-exam/preview" element={
        <ProtectedRoute>
          <EyeExamTemplate />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/form-33" element={
        <ProtectedRoute>
          <Form33Form />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/form-33/preview" element={
        <ProtectedRoute>
          <Form33Template />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/health-register" element={
        <ProtectedRoute>
          <HealthRegisterForm />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/health-register/preview" element={
        <ProtectedRoute>
          <HealthRegisterTemplate />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/xray-report" element={
        <ProtectedRoute>
          <XRayReportForm />
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:patientId/xray-report/preview" element={
        <ProtectedRoute>
          <XRayReportTemplate />
        </ProtectedRoute>
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
