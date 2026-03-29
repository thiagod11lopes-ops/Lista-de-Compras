import { useId, useState } from "react";
import type { SyncStatusUi } from "../hooks/useFirestoreListaSync";

type Props = {
  firebaseConfigurado: boolean;
  syncAtivo: boolean;
  syncStatus: SyncStatusUi;
  syncErro: string | null;
  onLigar: (nome: string, senha: string) => Promise<void> | void;
  onDesligar: () => void;
};

export function SecaoSyncFirebase({
  firebaseConfigurado,
  syncAtivo,
  syncStatus,
  syncErro,
  onLigar,
  onDesligar,
}: Props) {
  const baseId = useId();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLigar() {
    const n = nome.trim();
    const s = senha;
    if (!n || !s) return;
    setBusy(true);
    try {
      await onLigar(n, s);
      setSenha("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-violet-200/90 bg-violet-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-violet-950">
        Sincronização em tempo real
      </p>
      <p className="mt-1 text-xs leading-relaxed text-violet-950/85">
        Vários dispositivos podem partilhar a mesma lista pela nuvem (Firebase).
        Defina um nome de sala e a mesma palavra-passe em cada telemóvel ou
        computador. Quem se liga a uma sala que já tem dados na nuvem passa a
        usar esses dados.
      </p>

      {!firebaseConfigurado ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          Para ativar, crie um projeto no Firebase, ative o Firestore e copie as
          chaves para um ficheiro{" "}
          <code className="rounded bg-white/80 px-1">.env</code> (ver{" "}
          <code className="rounded bg-white/80 px-1">.env.example</code> na raiz
          do projeto). Reinicie o servidor de desenvolvimento depois de gravar.
        </p>
      ) : null}

      {firebaseConfigurado && syncAtivo ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-violet-900">
            {syncStatus === "a_ligar" && "A ligar à nuvem…"}
            {syncStatus === "sincronizando" && "Sincronização ativa — alterações propagam em tempo real."}
            {syncStatus === "erro" && "Erro de sincronização."}
            {syncStatus === "desligado" && "A aguardar…"}
          </p>
          {syncErro ? (
            <p className="text-xs text-red-700" role="alert">
              {syncErro}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onDesligar}
            className="min-h-[44px] w-full rounded-xl border border-violet-300 bg-white py-2.5 text-sm font-semibold text-violet-950 transition active:scale-[0.98]"
          >
            Desligar sincronização
          </button>
        </div>
      ) : null}

      {firebaseConfigurado && !syncAtivo ? (
        <div className="mt-3 space-y-2">
          <div>
            <label
              htmlFor={`${baseId}-sala`}
              className="text-xs font-medium text-violet-900"
            >
              Nome da sala
            </label>
            <input
              id={`${baseId}-sala`}
              type="text"
              autoComplete="off"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: família, casa"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-violet-200 bg-white px-3 text-base text-slate-900 shadow-inner outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            />
          </div>
          <div>
            <label
              htmlFor={`${baseId}-senha`}
              className="text-xs font-medium text-violet-900"
            >
              Palavra-passe da sala
            </label>
            <input
              id={`${baseId}-senha`}
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="A mesma em todos os aparelhos"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-violet-200 bg-white px-3 text-base text-slate-900 shadow-inner outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            />
          </div>
          <button
            type="button"
            disabled={busy || !nome.trim() || !senha}
            onClick={() => void handleLigar()}
            className="min-h-[44px] w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "A ligar…" : "Ligar sincronização"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
