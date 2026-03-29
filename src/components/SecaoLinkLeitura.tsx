import { useState } from "react";

type Props = {
  firebaseConfigurado: boolean;
  onCriarLink: () => Promise<string>;
};

export function SecaoLinkLeitura({
  firebaseConfigurado,
  onCriarLink,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function gerar() {
    setErro(null);
    setCopiado(false);
    setBusy(true);
    try {
      const u = await onCriarLink();
      setUrl(u);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function copiar() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200/90 bg-teal-50/70 px-4 py-3">
      <p className="text-sm font-semibold text-teal-950">
        Link só leitura
      </p>
      <p className="mt-1 text-xs leading-relaxed text-teal-950/85">
        Gera um endereço para outra pessoa consultar as suas listas e itens
        sem poder editar. Cada novo link é um instantâneo naquele momento.
      </p>
      {!firebaseConfigurado ? (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          Requer Firebase configurado (mesmo do .env da sincronização).
        </p>
      ) : (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => void gerar()}
            className="mt-3 min-h-[44px] w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/25 transition enabled:active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "A gerar…" : "Gerar link só leitura"}
          </button>
          {erro ? (
            <p className="mt-2 text-xs text-red-700" role="alert">
              {erro}
            </p>
          ) : null}
          {url ? (
            <div className="mt-3 space-y-2">
              <p className="break-all rounded-xl border border-teal-200/80 bg-white/90 px-3 py-2 font-mono text-[11px] leading-snug text-slate-800">
                {url}
              </p>
              <button
                type="button"
                onClick={() => void copiar()}
                className="min-h-[44px] w-full rounded-xl border border-teal-300 bg-white py-2.5 text-sm font-semibold text-teal-900 transition active:scale-[0.98]"
              >
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
