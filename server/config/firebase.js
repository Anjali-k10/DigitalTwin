import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Used for authentication, cloud storage, and other Firebase services
 */
export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      return admin;
    }

    // Initialize Firebase with environment variables
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });

    console.log('✅ Firebase Admin SDK initialized');
    return admin;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    // Don't exit here - Firebase is optional
    return null;
  }
};

/**
 * Verify Firebase ID token
 * Validates tokens from Firebase Authentication
 */
export const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid Firebase token: ${error.message}`);
  }
};

export default initializeFirebase;
