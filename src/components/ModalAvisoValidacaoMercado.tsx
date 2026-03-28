import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId } from "react";

type Props = {
  aberto: boolean;
  nomeItem: string;
  mensagem: string;
  onFechar: () => void;
};

export function ModalAvisoValidacaoMercado({
  aberto,
  nomeItem,
  mensagem,
  onFechar,
}: Props) {
  const tituloId = useId();
  const descId = useId();

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

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
            aria-label="Fechar"
            onClick={onFechar}
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
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-amber-200/90 bg-white shadow-2xl shadow-amber-900/15"
          >
            <div className="shrink-0 border-b border-amber-100/90 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-amber-950"
              >
                Dados incompletos
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {nomeItem}
              </p>
            </div>
            <div className="px-5 py-4">
              <p id={descId} className="text-sm leading-relaxed text-slate-600">
                {mensagem}
              </p>
            </div>
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={onFechar}
                className="min-h-[48px] w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
