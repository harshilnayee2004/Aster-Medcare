const PATIENTS_KEY = "health-check-patients";

export function getPatients() {
  try {
    return JSON.parse(localStorage.getItem(PATIENTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function savePatients(patients) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function getPatient(patientId) {
  return getPatients().find((patient) => patient.patientId === patientId);
}

export function upsertPatient(patient) {
  const patients = getPatients();
  const index = patients.findIndex((item) => item.patientId === patient.patientId);
  const nextPatients = [...patients];

  if (index >= 0) {
    nextPatients[index] = { ...nextPatients[index], ...patient };
  } else {
    nextPatients.push(patient);
  }

  savePatients(nextPatients);
  return patient;
}

export function updatePatientForm(patientId, formKey, data) {
  const patient = getPatient(patientId);
  if (!patient) return null;

  const updated = {
    ...patient,
    [formKey]: {
      ...data,
      savedAt: new Date().toISOString(),
    },
  };

  upsertPatient(updated);
  return updated;
}

export function formatDate(value = new Date()) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB").format(date);
}

export function formatDateTime(value = new Date()) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
