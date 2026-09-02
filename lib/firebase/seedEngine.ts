import { adminDb } from "./admin";
import { SEED_PROJECTS, SEED_PARCELS, SEED_OBJECTIONS, SEED_AWARDS } from "./mockData";

export async function runFirestoreSeed() {
  const batch = adminDb.batch();

  // 1. Seed Projects
  SEED_PROJECTS.forEach((project) => {
    const ref = adminDb.collection("projects").doc(project.id);
    batch.set(ref, project, { merge: true });
  });

  // 2. Seed Cadastral Parcels
  SEED_PARCELS.forEach((parcel) => {
    const ref = adminDb.collection("cadastral_parcels").doc(parcel.id);
    batch.set(ref, parcel, { merge: true });
  });

  // 3. Seed Objections
  SEED_OBJECTIONS.forEach((obj) => {
    const ref = adminDb.collection("objections").doc(obj.id);
    batch.set(ref, obj, { merge: true });
  });

  // 4. Seed Awards
  SEED_AWARDS.forEach((award) => {
    const ref = adminDb.collection("awards").doc(award.id);
    batch.set(ref, award, { merge: true });
  });

  // Commit atomic batch transaction
  await batch.commit();
  console.log("Firestore successfully populated with BhoomiSetu production records.");
  return { status: "success", seededAt: new Date().toISOString() };
}
