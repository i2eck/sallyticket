import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Same Firebase project the original ticketing app used, so tickets sold there
// stay visible here. These are public web-app identifiers, not secrets; access
// is controlled by your Firestore security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyD6wUD2wLSSEQxbkLBPeZ8ksmek_8SM48c',
  authDomain: 'sallyjoy-19efc.firebaseapp.com',
  projectId: 'sallyjoy-19efc',
  storageBucket: 'sallyjoy-19efc.firebasestorage.app',
  messagingSenderId: '416346266936',
  appId: '1:416346266936:web:e103c14a25a1d710b335cd',
}

let cached: Firestore | null = null

// Call only from the browser (effects and event handlers), never during SSR.
export function getDb(): Firestore {
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    cached = getFirestore(app)
  }
  return cached
}
