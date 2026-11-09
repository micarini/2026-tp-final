// Firebase Admin: solo en el servidor. Valida sesiones y escribe en Firestore.
// "server-only" hace fallar el build si este archivo se importa desde el navegador.
import "server-only";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // En .env la clave viene con "\n" escritos como texto: los pasamos a saltos de línea reales.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Funciones en vez de constantes: así Firebase se inicializa recién cuando se usa,
// y el build no falla en una máquina que todavía no tiene las variables de entorno.
export function adminAuth() {
  return getAuth(getAdminApp());
}

export function db() {
  return getFirestore(getAdminApp());
}
