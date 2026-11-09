// Firebase del lado del navegador. Solo se usa para iniciar sesión:
// las contraseñas van directo del navegador a Firebase, nunca pasan por nuestro servidor.
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Función en vez de constante: se inicializa recién al hacer clic, en el navegador.
// Así el build no se rompe si todavía no hay variables de entorno.
// getApps() evita inicializar dos veces cuando Next recarga el módulo en desarrollo.
export function getClientAuth() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getAuth(app);
}
