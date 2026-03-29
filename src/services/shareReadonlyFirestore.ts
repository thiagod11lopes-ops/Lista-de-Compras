import { doc, getDoc, setDoc } from "firebase/firestore";
import { garantirEstadoValido, type EstadoLista } from "./storage";
import { obterFirestore } from "./firebaseApp";

const COLECAO = "listaComprasVerSomente_v1";

export type DadosPartilhaLeitura = {
  payload: string;
  criadoEm: number;
};

export function gerarIdPartilha(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Grava um snapshot imutável; devolve o id (64 hex) para usar no URL. */
export async function publicarEstadoSomenteLeitura(
  estado: EstadoLista,
): Promise<string> {
  const db = obterFirestore();
  if (!db) throw new Error("Firestore indisponível");
  const id = gerarIdPartilha();
  const ref = doc(db, COLECAO, id);
  await setDoc(ref, {
    payload: JSON.stringify(estado),
    criadoEm: Date.now(),
  } satisfies DadosPartilhaLeitura);
  return id;
}

export async function obterEstadoSomenteLeitura(
  id: string,
): Promise<EstadoLista | null> {
  const db = obterFirestore();
  if (!db) throw new Error("Firestore indisponível");
  const ref = doc(db, COLECAO, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data() as Record<string, unknown>;
  if (typeof d.payload !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(d.payload);
    return garantirEstadoValido(parsed as EstadoLista);
  } catch {
    return null;
  }
}
