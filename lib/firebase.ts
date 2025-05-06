import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { 
  getAuth, 
  type Auth, 
  setPersistence, 
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from "firebase/auth"

// Load Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Set persistence to SESSION (this will keep the user signed in only for the current session)
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error)
  })

// Session timeout in milliseconds (8 hours)
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000

// Function to handle session timeout - only runs on client side
const handleSessionTimeout = () => {
  // Check if we're on the client side
  if (typeof window === 'undefined') return

  let timeoutId: NodeJS.Timeout

  const resetTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      signOut(auth)
    }, SESSION_TIMEOUT)
  }

  // Reset timeout on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  events.forEach(event => {
    window.addEventListener(event, resetTimeout)
  })

  // Initial timeout setup
  onAuthStateChanged(auth, (user) => {
    if (user) {
      resetTimeout()
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  })

  // Cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    events.forEach(event => {
      window.removeEventListener(event, resetTimeout)
    })
  }
}

// Initialize session timeout only on client side
if (typeof window !== 'undefined') {
  handleSessionTimeout()
}

// Activity tracking types
export type ActivityType = 
  | 'page_created'
  | 'page_updated'
  | 'page_deleted'
  | 'section_created'
  | 'section_updated'
  | 'section_deleted'

export interface Activity {
  type: ActivityType;
  pageId: string;
  pageTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  timestamp: Date;
  userId: string;
}

// Function to track activities
export const trackActivity = async (activity: Omit<Activity, 'timestamp' | 'userId'>) => {
  try {
    if (!auth.currentUser) throw new Error("No user logged in")
    if (!db) throw new Error("Firebase is not initialized")

    const activityData = {
      ...activity,
      timestamp: serverTimestamp(),
      userId: auth.currentUser.uid,
    }

    await addDoc(collection(db, "activities"), activityData)
  } catch (error) {
    console.error("Error tracking activity:", error)
  }
}

export { app, db, auth }
