import "server-only";

import { db } from "@/lib/firebase-admin";

function fechaUTC() {
  return new Date().toISOString().slice(0, 10);
}

export async function consumirPedido(uid) {
  if (!uid) throw new Error("No se puede consumir un pedido sin usuario.");

  const referencia = db().doc(`users/${uid}/usoIA/${fechaUTC()}`);
  return db().runTransaction(async (transaccion) => {
    const snapshot = await transaccion.get(referencia);
    const pedidos = snapshot.exists ? Number(snapshot.data().pedidos ?? 0) : 0;
    if (pedidos >= 20) {
      throw new Error("Llegaste al límite de pedidos de IA de hoy.");
    }

    transaccion.set(referencia, {
      pedidos: pedidos + 1,
      actualizadoEn: new Date(),
    }, { merge: true });

    return { pedidos: pedidos + 1, restantes: 19 - pedidos };
  });
}
