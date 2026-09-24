import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBnogFN6EznqB6Pfkk_qk2aecRS6N3VPUg',
  authDomain: 'resume-pilot-509509.firebaseapp.com',
  projectId: 'resume-pilot-509509',
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
