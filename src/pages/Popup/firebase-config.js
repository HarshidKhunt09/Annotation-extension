import { getApp, getApps, initializeApp } from '../../firebase-app';
import { getDatabase, ref } from '../../firebase-database';

const configs = {
  apiKey: 'AIzaSyBz2NXNZ_3PJAawNDUoIolW5cuO9x7i4Xs',
  authDomain: 'ga4-notes-3e831.firebaseapp.com',
  projectId: 'ga4-notes-3e831',
  storageBucket: 'ga4-notes-3e831.appspot.com',
  messagingSenderId: '81175638260',
  appId: '1:81175638260:web:45af8a000f082a4186eea1',
};

async function initializeFirebase() {
  if (navigator.onLine) {
    const app = !getApps().length ? initializeApp(configs) : getApp();
    const database = getDatabase(app);
    return ref(database, 'users');
  } else {
    console.log('Device is offline.');
    return null;
  }
}

export let userRef;
async function fetchData() {
  try {
    userRef = await initializeFirebase();
  } catch (error) {
    userRef = undefined;
  }
}

// fetchData();
