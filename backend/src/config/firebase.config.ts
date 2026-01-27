import admin from 'firebase-admin';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// Initialize Firebase Admin
// Tenta usar o arquivo JSON primeiro, depois fallback para variáveis de ambiente
let credential: admin.credential.Credential;

try {
  // Caminho para o arquivo JSON do Firebase Admin SDK
  const serviceAccountPath = path.join(__dirname, '../../straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');
  const serviceAccount = require(serviceAccountPath);
  
  credential = admin.credential.cert(serviceAccount);
  console.log('✅ Firebase Admin inicializado com arquivo JSON');
} catch (error) {
  // Fallback para variáveis de ambiente
  console.log('⚠️ Arquivo JSON não encontrado, usando variáveis de ambiente');
  
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  
  credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
}

admin.initializeApp({
  credential,
  storageBucket: 'straxis-6e4bc.firebasestorage.app',
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const firestore = db; // Alias para compatibilidade

export default admin;
