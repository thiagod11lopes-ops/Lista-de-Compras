import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { obterFirebaseOptions } from "../config/firebaseEnv";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function obterFirestore(): Firestore | null {
  const opts = obterFirebaseOptions();
  if (!opts) return null;
  if (!app) {
    app = initializeApp(opts);
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}
