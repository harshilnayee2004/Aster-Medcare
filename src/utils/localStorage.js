import api from "../services/api";

/**
 * Fetch all patients from backend
 * @returns {Promise<Array>} List of patients
 */
export async function getPatients() {
  const response = await api.get("/patients");
  return response.data;
}

/**
 * Fetch single patient from backend by patientId or objectId
 * @param {string} patientId 
 * @returns {Promise<Object>} Patient details
 */
export async function getPatient(patientId) {
  const response = await api.get(`/patients/${patientId}`);
  return response.data;
}

/**
 * Create or insert a new patient record
 * @param {Object} patient 
 * @returns {Promise<Object>} Created patient details
 */
export async function upsertPatient(patient) {
  const response = await api.post("/patients", patient);
  return response.data;
}

/**
 * Update form data on the backend for a specific patient and form key
 * @param {string} patientId 
 * @param {string} formKey 
 * @param {Object} data 
 * @returns {Promise<Object>} Saved form data response
 */
export async function updatePatientForm(patientId, formKey, data) {
  const response = await api.post(`/patients/${patientId}/forms/${formKey}`, { data });
  return response.data;
}

/**
 * Helper to format date in DD/MM/YYYY format
 */
export function formatDate(value = new Date()) {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB").format(date);
}

/**
 * Helper to format date and time in DD/MM/YYYY, HH:MM format
 */
export function formatDateTime(value = new Date()) {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
