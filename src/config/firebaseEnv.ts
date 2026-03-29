/** Variáveis Vite para o projeto Firebase (Console → Configuração do projeto). */
export function firebaseConfigCompleto(): boolean {
  const e = import.meta.env;
  return Boolean(
    e.VITE_FIREBASE_API_KEY &&
      e.VITE_FIREBASE_AUTH_DOMAIN &&
      e.VITE_FIREBASE_PROJECT_ID &&
      e.VITE_FIREBASE_APP_ID,
  );
}

export function obterFirebaseOptions():
  | {
      apiKey: string;
      authDomain: string;
      projectId: string;
      appId: string;
      storageBucket?: string;
      messagingSenderId?: string;
    }
  | null {
  if (!firebaseConfigCompleto()) return null;
  const e = import.meta.env;
  return {
    apiKey: e.VITE_FIREBASE_API_KEY as string,
    authDomain: e.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: e.VITE_FIREBASE_PROJECT_ID as string,
    appId: e.VITE_FIREBASE_APP_ID as string,
    storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
}
