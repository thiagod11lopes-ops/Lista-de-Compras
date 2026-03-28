import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  onZerarSistema: () => void;
};

export function ModalConfiguracoes({
  aberto,
  onFechar,
  onZerarSistema,
}: Props) {
  const tituloId = useId();
  const tituloConfirmId = useId();
  const descConfirmId = useId();
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  useEffect(() => {
    if (!aberto) setConfirmacaoAberta(false);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (confirmacaoAberta) {
        setConfirmacaoAberta(false);
      } else {
        onFechar();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, confirmacaoAberta, onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  function executarZerar() {
    onZerarSistema();
    setConfirmacaoAberta(false);
    onFechar();
  }

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
            aria-label={confirmacaoAberta ? "Voltar" : "Fechar"}
            onClick={() =>
              confirmacaoAberta ? setConfirmacaoAberta(false) : onFechar()
            }
          />
          <AnimatePresence mode="wait">
            {confirmacaoAberta ? (
              <motion.div
                key="confirm"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={tituloConfirmId}
                aria-describedby={descConfirmId}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-red-200/90 bg-white shadow-2xl shadow-red-900/15"
              >
                <div className="border-b border-red-100 px-5 pb-3 pt-5">
                  <h2
                    id={tituloConfirmId}
                    className="text-lg font-bold text-red-950"
                  >
                    Apagar todos os dados?
                  </h2>
                </div>
                <div className="px-5 py-4">
                  <p
                    id={descConfirmId}
                    className="text-sm leading-relaxed text-slate-700"
                  >
                    <strong className="text-slate-900">
                      Todos os dados do sistema serão perdidos de forma
                      definitiva.
                    </strong>{" "}
                    Isso inclui itens, categorias e o histórico do balanço. Esta
                    ação não pode ser desfeita.
                  </p>
                </div>
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmacaoAberta(false)}
                    className="min-h-[48px] flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={executarZerar}
                    className="min-h-[48px] flex-1 rounded-2xl bg-red-600 py-3 text-base font-semibold text-white shadow-md shadow-red-500/25 transition active:scale-[0.98]"
                  >
                    Apagar definitivamente
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                role="dialog"
                aria-modal="true"
                aria-labelledby={tituloId}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
              >
                <div className="border-b border-slate-100 px-5 pb-3 pt-5">
                  <h2
                    id={tituloId}
                    className="text-lg font-bold text-blue-950"
                  >
                    Configurações
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Opções gerais do aplicativo. Os dados ficam apenas neste
                    aparelho.
                  </p>
                </div>

                <div className="space-y-3 px-5 py-4">
                  <div className="rounded-2xl border border-red-200/90 bg-red-50/80 px-4 py-3">
                    <p className="text-sm font-semibold text-red-900">
                      Zerar sistema
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-red-800/90">
                      Remove toda a lista de compras, categorias e registros do
                      balanço, como se o app tivesse acabado de ser instalado.
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirmacaoAberta(true)}
                      className="mt-3 min-h-[44px] w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/25 transition active:scale-[0.98]"
                    >
                      Apagar todos os dados
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4">
                  <button
                    type="button"
                    onClick={onFechar}
                    className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
