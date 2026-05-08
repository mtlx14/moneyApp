// Import the functions you need from the SDKs you need
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyAEoxLLMqVf7IE1wjl9PR3j5eSiadkMbzY',
  authDomain: 'moneyapp-452ab.firebaseapp.com',
  projectId: 'moneyapp-452ab',
  storageBucket: 'moneyapp-452ab.firebasestorage.app',
  messagingSenderId: '834278591547',
  appId: '1:834278591547:web:005a3b9dae24f29b0e201e',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default initializeFirestore(
  app,
  Platform.OS === 'web'
    ? { experimentalForceLongPolling: true }
    : { experimentalAutoDetectLongPolling: true },
);
