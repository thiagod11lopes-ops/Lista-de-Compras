import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  /** Oculto em offline (a barra offline já explica o contexto). */
  visivel: boolean;
  disabled?: boolean;
};

/**
 * Ícone fixo ao lado do tutorial: ao clicar, mostra o texto sobre dados locais.
 */
export function FaixaDadosLocais({ visivel, disabled = false }: Props) {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={aberto}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setAberto((v) => !v)}
        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Dados neste aparelho — informação"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-6 w-6 text-blue-600"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {aberto ? (
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Dados neste aparelho"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[min(calc(100vw-1.5rem),18rem)] rounded-2xl border border-blue-200/80 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:left-0"
          >
            <p className="text-left text-xs leading-relaxed text-slate-700 sm:text-[13px]">
              <span className="font-semibold text-blue-950">
                Dados neste aparelho.
              </span>{" "}
              {visivel ? (
                <>
                  A lista e o balanço funcionam sem internet; nada é enviado
                  para um servidor. Só a leitura de código de barras precisa de
                  rede para procurar o nome do produto.
                </>
              ) : (
                <>
                  Sem ligação à internet: tudo continua guardado só aqui. A
                  barra no topo lembra o modo offline. Só o escanear código de
                  barras precisa de rede para procurar o nome do produto.
                </>
              )}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
