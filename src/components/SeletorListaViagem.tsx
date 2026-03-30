import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

function rotuloLista(nome: string): string {
  const t = nome.trim();
  return t ? t : "Nome pendente";
}

type ViagemResumo = { id: string; nome: string };

type Props = {
  viagens: ViagemResumo[];
  viagemAtivaId: string;
  onSelecionar: (id: string) => void;
  disabled?: boolean;
  /** Só na aba Iniciar compras, quando existem categorias. */
  onAbrirOrdemCorredores?: () => void;
  mostrarBotaoCorredores?: boolean;
};

/**
 * Dropdown completo — visível a partir de `md` no fluxo da página.
 * Em mobile o controlo passa para {@link SeletorListaViagemIcone} na barra fixa.
 */
export function SeletorListaViagem({
  viagens,
  viagemAtivaId,
  onSelecionar,
  disabled = false,
  onAbrirOrdemCorredores,
  mostrarBotaoCorredores = false,
}: Props) {
  const exibirOrdemCorredores =
    mostrarBotaoCorredores && onAbrirOrdemCorredores != null;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <label className="sr-only" htmlFor="seletor-viagem-inline">
          Lista de compras ativa
        </label>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Lista
        </span>
        <select
          id="seletor-viagem-inline"
          disabled={disabled || viagens.length === 0}
          value={viagemAtivaId}
          onChange={(e) => onSelecionar(e.target.value)}
          className="min-h-[44px] w-full min-w-0 flex-1 truncate rounded-xl border-2 border-blue-100 bg-white/90 px-3 text-sm font-semibold text-blue-950 shadow-inner outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        >
          {viagens.length === 0 ? (
            <option value="">Nenhuma lista</option>
          ) : (
            viagens.map((v) => (
              <option key={v.id} value={v.id}>
                {rotuloLista(v.nome)}
              </option>
            ))
          )}
        </select>
      </div>
      {exibirOrdemCorredores ? (
        <button
          type="button"
          onClick={onAbrirOrdemCorredores}
          className="shrink-0 rounded-xl border border-blue-200/90 bg-white/90 px-3 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-[0.98] sm:self-center sm:whitespace-nowrap"
        >
          Ordem dos corredores
        </button>
      ) : null}
    </div>
  );
}

/** Botão com ícone na barra superior (mobile): abre painel com o mesmo seletor. */
export function SeletorListaViagemIcone({
  viagens,
  viagemAtivaId,
  onSelecionar,
  disabled = false,
  onAbrirOrdemCorredores,
  mostrarBotaoCorredores = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const selectId = useId();

  useEffect(() => {
    if (!aberto) return;
    function fecharSeFora(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("pointerdown", fecharSeFora);
    return () => document.removeEventListener("pointerdown", fecharSeFora);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [aberto]);

  const viagemAtiva = viagens.find((v) => v.id === viagemAtivaId);
  const nomeAtivo =
    viagemAtiva != null
      ? rotuloLista(viagemAtiva.nome)
      : viagens.length === 0
        ? "Nenhuma lista"
        : "Nome pendente";

  return (
    <div ref={wrapRef} className="relative md:hidden">
      <button
        type="button"
        disabled={disabled || viagens.length === 0}
        aria-expanded={aberto}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setAberto((v) => !v)}
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
        title={nomeAtivo}
        aria-label={`Lista ativa: ${nomeAtivo}. Escolher lista por viagem`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 text-blue-600"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {aberto ? (
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Escolher lista por viagem"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-blue-200/80 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur-md"
          >
            <label
              htmlFor={selectId}
              className="mb-2 block text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Lista por viagem
            </label>
            <select
              id={selectId}
              disabled={disabled || viagens.length === 0}
              value={viagemAtivaId}
              onChange={(e) => {
                onSelecionar(e.target.value);
                setAberto(false);
              }}
              className="min-h-[44px] w-full rounded-xl border-2 border-blue-100 bg-white/90 px-3 text-sm font-semibold text-blue-950 shadow-inner outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            >
              {viagens.length === 0 ? (
                <option value="">Nenhuma lista</option>
              ) : (
                viagens.map((v) => (
                  <option key={v.id} value={v.id}>
                    {rotuloLista(v.nome)}
                  </option>
                ))
              )}
            </select>
            {mostrarBotaoCorredores && onAbrirOrdemCorredores ? (
              <button
                type="button"
                onClick={() => {
                  onAbrirOrdemCorredores();
                  setAberto(false);
                }}
                className="mt-3 w-full rounded-xl border border-blue-200/90 bg-white/90 px-3 py-2.5 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-[0.98]"
              >
                Ordem dos corredores
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
