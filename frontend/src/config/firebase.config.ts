/**
 * Firebase Configuration - Frontend
 * Configuração do Firebase para o cliente web
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDl5ZStMzyjtkLApdK4rsFuG_XIm1ewUOY",
  authDomain: "straxis-6e4bc.firebaseapp.com",
  projectId: "straxis-6e4bc",
  storageBucket: "straxis-6e4bc.firebasestorage.app",
  messagingSenderId: "648877578703",
  appId: "1:648877578703:web:c2871c4f370436590a1aba",
  measurementId: "G-2NXVBFE03P"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (apenas em produção)
let analytics;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;

console.log('✅ Firebase inicializado no frontend');
console.log('📦 Project ID:', firebaseConfig.projectId);
