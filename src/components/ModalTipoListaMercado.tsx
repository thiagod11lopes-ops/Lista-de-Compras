import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

const STORAGE_JA_ESCOLHEU_TIPO =
  "listaCompra-tipo-lista-ja-escolheu-v1";

const FRASE_SESSAO =
  "Escolha como deseja usar a lista nesta sessão.";

type Props = {
  aberto: boolean;
  onEscolherSimples: () => void;
  onEscolherCompleta: () => void;
  onFechar: () => void;
};

function lerJaEscolheuTipo(): boolean {
  try {
    return localStorage.getItem(STORAGE_JA_ESCOLHEU_TIPO) === "1";
  } catch {
    return false;
  }
}

function marcarTipoEscolhido() {
  try {
    localStorage.setItem(STORAGE_JA_ESCOLHEU_TIPO, "1");
  } catch {
    /* ignore */
  }
}

export function ModalTipoListaMercado({
  aberto,
  onEscolherSimples,
  onEscolherCompleta,
  onFechar,
}: Props) {
  const tituloId = useId();
  const [charsFrase, setCharsFrase] = useState(0);
  const mostrarPrimeiraVez = aberto && !lerJaEscolheuTipo();

  useEffect(() => {
    if (!mostrarPrimeiraVez) {
      setCharsFrase(0);
      return;
    }
    setCharsFrase(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCharsFrase(i);
      if (i >= FRASE_SESSAO.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [mostrarPrimeiraVez]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  const aoSimples = () => {
    marcarTipoEscolhido();
    onEscolherSimples();
  };

  const aoCompleta = () => {
    marcarTipoEscolhido();
    onEscolherCompleta();
  };

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={onFechar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/25"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 pr-1">
                  <h2
                    id={tituloId}
                    className="text-lg font-bold text-blue-950"
                  >
                    Tipo de lista do mercado
                  </h2>
                  {mostrarPrimeiraVez ? (
                    <p
                      className="mt-2 min-h-[3.25rem] text-sm font-semibold leading-relaxed"
                      aria-live="polite"
                    >
                      <span
                        className="bg-gradient-to-r from-orange-500 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(249,115,22,0.65)]"
                        style={{
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                        }}
                      >
                        {FRASE_SESSAO.slice(0, charsFrase)}
                      </span>
                      {charsFrase < FRASE_SESSAO.length ? (
                        <span
                          className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse rounded-sm bg-orange-500 align-middle shadow-[0_0_8px_#f97316]"
                          aria-hidden
                        />
                      ) : null}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {FRASE_SESSAO}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onFechar}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.96]"
                  aria-label="Fechar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 py-4">
              <button
                type="button"
                onClick={aoCompleta}
                className={[
                  "flex w-full flex-col items-start gap-1 rounded-2xl border-2 px-4 py-3 text-left active:scale-[0.99]",
                  mostrarPrimeiraVez
                    ? "animate-tipo-lista-borda-a border-slate-200 bg-gradient-to-br from-blue-50 to-white transition-none"
                    : "border-blue-200/90 bg-gradient-to-br from-blue-50 to-white transition hover:border-blue-400",
                ].join(" ")}
              >
                <span className="text-base font-bold text-blue-950">
                  Lista completa
                </span>
                <span className="text-sm leading-snug text-slate-600">
                  Preço, quantidade e total por item. Finalização com resumo em
                  reais no balanço (gráficos e totais).
                </span>
              </button>
              <button
                type="button"
                onClick={aoSimples}
                className={[
                  "flex w-full flex-col items-start gap-1 rounded-2xl border-2 bg-slate-50/90 px-4 py-3 text-left active:scale-[0.99]",
                  mostrarPrimeiraVez
                    ? "animate-tipo-lista-borda-b border-slate-200 transition-none"
                    : "border-slate-200 transition hover:border-blue-300 hover:bg-blue-50/80",
                ].join(" ")}
              >
                <span className="text-base font-bold text-blue-950">
                  Lista simples
                </span>
                <span className="text-sm leading-snug text-slate-600">
                  Somente o nome do item e o checklist. Sem preço, quantidade nem
                  total. Ao finalizar, o registro vai para uma área separada no
                  balanço (sem valores em reais).
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
