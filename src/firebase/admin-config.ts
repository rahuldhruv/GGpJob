
import * as admin from 'firebase-admin';

// Ensure your service account details are set in .env.local
if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set in .env.local');
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL is not set in .env.local');
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set in .env.local');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly.
        // In your .env.local file, it should be enclosed in quotes like this:
        // FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
