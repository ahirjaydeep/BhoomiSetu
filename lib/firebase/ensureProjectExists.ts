import { adminDb } from "./admin";
import { runFirestoreSeed } from "./seedEngine";

export async function ensureProjectExists(projectId: string) {
  const docRef = adminDb.collection("projects").doc(projectId);
  const snap = await docRef.get();

  if (!snap.exists) {
    console.warn(`Project '${projectId}' not found in Firestore. Executing automatic seed engine...`);
    await runFirestoreSeed();
  }
}
