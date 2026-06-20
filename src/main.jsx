import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { upsertPatient } from "./utils/localStorage.js";

// Bootstrap check: Handle shareable links
const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get("sharedData");
if (sharedData) {
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
    if (decoded && decoded.patientId) {
      upsertPatient(decoded);
      // Navigate cleanly to the full report preview
      const cleanPath = `${window.location.origin}/patients/${decoded.patientId}/full-report/preview`;
      window.location.replace(cleanPath);
    }
  } catch (e) {
    console.error("Failed to decode shared patient data:", e);
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
