import * as admin from 'firebase-admin';

const getFirebaseAdminConfig = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin environment variables: Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
    );
  }

  // Ensure newlines in the private key are properly formatted
  privateKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId,
    clientEmail,
    privateKey,
  };
};

if (!admin.apps.length) {
  const config = getFirebaseAdminConfig();
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
