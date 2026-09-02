import { runFirestoreSeed } from "../lib/firebase/seedEngine";

console.log("Starting BhoomiSetu Firestore Database Seeding...");
runFirestoreSeed()
  .then(() => {
    console.log("Seeding complete! Restarting real-time listeners...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
