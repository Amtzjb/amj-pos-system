// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Usamos las variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// 1. Inicializar la App
const app = initializeApp(firebaseConfig);

// 2. Exportar los servicios listos para usar en toda la app
export const db = getFirestore(app); // Base de datos
export const auth = getAuth(app);    // Autenticación

export default app;