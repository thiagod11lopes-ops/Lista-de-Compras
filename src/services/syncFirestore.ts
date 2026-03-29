import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { EstadoLista } from "./storage";
import { obterFirestore } from "./firebaseApp";

const COLECAO = "listaComprasSync_v1";

export type DadosSyncFirestore = {
  payload: string;
  updatedAt: number;
};

export async function garantirDocumentoInicial(
  roomHash: string,
  estado: EstadoLista,
): Promise<void> {
  const db = obterFirestore();
  if (!db) throw new Error("Firestore indisponível");
  const ref = doc(db, COLECAO, roomHash);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const payload = JSON.stringify(estado);
  await setDoc(ref, {
    payload,
    updatedAt: Date.now(),
  } satisfies DadosSyncFirestore);
}

export function subscreverSala(
  roomHash: string,
  onDados: (dados: DadosSyncFirestore) => void,
  onErro: (e: Error) => void,
): Unsubscribe {
  const db = obterFirestore();
  if (!db) {
    onErro(new Error("Firestore indisponível"));
    return () => {};
  }
  const ref = doc(db, COLECAO, roomHash);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() as Record<string, unknown>;
      const payload = d.payload;
      const updatedAt = d.updatedAt;
      if (typeof payload !== "string" || typeof updatedAt !== "number") {
        onErro(new Error("Formato de dados na nuvem inválido"));
        return;
      }
      onDados({ payload, updatedAt });
    },
    (e) => onErro(e instanceof Error ? e : new Error(String(e))),
  );
}

export async function enviarEstado(
  roomHash: string,
  estado: EstadoLista,
): Promise<void> {
  const db = obterFirestore();
  if (!db) throw new Error("Firestore indisponível");
  const ref = doc(db, COLECAO, roomHash);
  await setDoc(
    ref,
    {
      payload: JSON.stringify(estado),
      updatedAt: Date.now(),
    } satisfies DadosSyncFirestore,
    { merge: true },
  );
}
