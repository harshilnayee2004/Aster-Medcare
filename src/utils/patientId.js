export function generatePatientId(existingPatients = []) {
  const year = new Date().getFullYear();
  const idsForYear = existingPatients
    .map((patient) => patient.patientId)
    .filter((id) => id?.startsWith(`PT-${year}-`))
    .map((id) => Number(id.split("-").at(-1)))
    .filter(Number.isFinite);

  const next = idsForYear.length ? Math.max(...idsForYear) + 1 : 1;
  return `PT-${year}-${String(next).padStart(4, "0")}`;
}
