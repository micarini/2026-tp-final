import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { db } from "@/lib/firebase-admin";

// Guarda la clave de Groq de cada usuario CIFRADA (AES-256-GCM) en users/{uid}/secretos/groq.
// La clave de cifrado vive solo en el servidor (SECRETS_ENCRYPTION_KEY, 32 bytes en base64).
// Esta clave nunca se manda al navegador: el perfil solo recibe los últimos 4 caracteres.

function claveMaestra() {
  const base64 = process.env.SECRETS_ENCRYPTION_KEY;
  if (!base64) throw new Error("Falta configurar SECRETS_ENCRYPTION_KEY en las variables del servidor.");
  const clave = Buffer.from(base64, "base64");
  if (clave.length !== 32) throw new Error("SECRETS_ENCRYPTION_KEY tiene que ser de 32 bytes en base64.");
  return clave;
}

function cifrar(texto) {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", claveMaestra(), iv);
  const datos = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  return {
    iv: iv.toString("base64"),
    datos: datos.toString("base64"),
    etiqueta: cifrador.getAuthTag().toString("base64"),
  };
}

function descifrar({ iv, datos, etiqueta }) {
  const descifrador = createDecipheriv("aes-256-gcm", claveMaestra(), Buffer.from(iv, "base64"));
  descifrador.setAuthTag(Buffer.from(etiqueta, "base64"));
  return Buffer.concat([
    descifrador.update(Buffer.from(datos, "base64")),
    descifrador.final(),
  ]).toString("utf8");
}

function referencia(uid) {
  return db().doc(`users/${uid}/secretos/groq`);
}

export async function guardarClaveGroq(uid, clave) {
  await referencia(uid).set({
    ...cifrar(clave),
    ultimos4: clave.slice(-4),
    actualizadoEn: new Date(),
  });
}

export async function quitarClaveGroq(uid) {
  await referencia(uid).delete();
}

// Devuelve la clave en texto, o null si el usuario no cargó una (o no se puede descifrar).
export async function obtenerClaveGroq(uid) {
  const snapshot = await referencia(uid).get();
  if (!snapshot.exists) return null;
  try {
    return descifrar(snapshot.data());
  } catch {
    return null;
  }
}

// Para el perfil: solo dice si hay clave y cómo termina.
export async function estadoClaveGroq(uid) {
  const snapshot = await referencia(uid).get();
  return snapshot.exists ? { cargada: true, ultimos4: snapshot.data().ultimos4 ?? "" } : { cargada: false, ultimos4: "" };
}
