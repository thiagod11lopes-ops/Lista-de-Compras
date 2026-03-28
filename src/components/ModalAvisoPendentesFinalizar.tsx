import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId } from "react";

type Props = {
  aberto: boolean;
  quantidadePendentes: number;
  onVoltar: () => void;
  onContinuar: () => void;
};

export function ModalAvisoPendentesFinalizar({
  aberto,
  quantidadePendentes,
  onVoltar,
  onContinuar,
}: Props) {
  const tituloId = useId();
  const descId = useId();

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onVoltar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onVoltar]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  const n = quantidadePendentes;
  const textoIntro =
    n === 1
      ? "Ainda há 1 item sem o checkbox de comprado marcado."
      : `Ainda há ${n} itens sem o checkbox de comprado marcado.`;

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            aria-label="Voltar"
            onClick={onVoltar}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            aria-describedby={descId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-blue-200/90 bg-white shadow-2xl shadow-blue-900/15"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 pb-3 pt-5">
              <h2 id={tituloId} className="text-lg font-bold text-blue-950">
                Itens pendentes
              </h2>
            </div>
            <div className="px-5 py-4">
              <p id={descId} className="text-sm leading-relaxed text-slate-600">
                {textoIntro}{" "}
                Você pode continuar e finalizar só com os que já estão marcados
                ou voltar para marcar os demais na lista.
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={onVoltar}
                className="min-h-[48px] flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={onContinuar}
                className="min-h-[48px] flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-base font-semibold text-white shadow-md shadow-emerald-500/25 transition active:scale-[0.98]"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
