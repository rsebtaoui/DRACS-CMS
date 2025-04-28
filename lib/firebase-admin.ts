import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Check if Firebase Admin is already initialized
const apps = getApps()

// If not initialized, initialize Firebase Admin
if (!apps.length) {
  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    
    // Fix for private key format when loaded from .env
    if (privateKey && !privateKey.includes('\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Check if all required environment variables are present
    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin SDK credentials in environment variables');
      // Initialize with a minimal config to prevent crashes, but admin functions won't work
      initializeApp();
    } else {
      // Initialize with credentials from environment variables
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Initialize with a minimal config to prevent crashes
    initializeApp();
  }
}

// Export Firestore instance
export const adminDb = getFirestore()
