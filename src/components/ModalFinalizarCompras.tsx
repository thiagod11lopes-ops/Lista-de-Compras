import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId } from "react";
import { formatarMoedaBRL } from "../utils/moeda";

type LinhaResumo = { nome: string; total: number };

export type BlocoResumoSimples = { titulo: string; nomes: string[] };

type Props = {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  /** Lista completa: resumo por categoria em R$. */
  linhas: LinhaResumo[];
  total: number;
  /** Lista simples: só nomes agrupados; ignora linhas/total para exibição. */
  listaSimples?: boolean;
  blocosResumoSimples?: BlocoResumoSimples[];
};

export function ModalFinalizarCompras({
  aberto,
  onFechar,
  onConfirmar,
  linhas,
  total,
  listaSimples = false,
  blocosResumoSimples = [],
}: Props) {
  const tituloId = useId();

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
            aria-label="Cancelar"
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
            className="relative z-10 flex max-h-[min(85dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20 sm:max-h-[min(90dvh,36rem)]"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-blue-950"
              >
                {listaSimples ? "Finalizar lista simples" : "Finalizar compras"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {listaSimples ? (
                  <>
                    Os itens marcados serão registrados no balanço na secção{" "}
                    <strong className="text-slate-800">
                      Listas Simples Utilizadas sem valores
                    </strong>
                    , separada dos totais com preço e quantidade. Os itens
                    comprados{" "}
                    <strong className="text-slate-800">
                      saem da Lista do Mercado
                    </strong>{" "}
                    e continuam em{" "}
                    <strong className="text-slate-800">Adicionar itens</strong> e
                    em{" "}
                    <strong className="text-slate-800">
                      Comprar Novamente
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    Confira o resumo abaixo. Ao confirmar, os valores serão
                    registrados no{" "}
                    <strong className="text-slate-800">Balanço</strong>. Os itens
                    marcados como comprados{" "}
                    <strong className="text-slate-800">
                      saem da Lista do Mercado
                    </strong>
                    , mas continuam em{" "}
                    <strong className="text-slate-800">Adicionar itens</strong>{" "}
                    e em{" "}
                    <strong className="text-slate-800">
                      Comprar Novamente
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
              {listaSimples ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Itens comprados (sem valores)
                  </p>
                  <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    {blocosResumoSimples.map((bloco, bi) => (
                      <div key={`${bloco.titulo}-${bi}`} className="space-y-1.5">
                        {bloco.titulo ? (
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {bloco.titulo}
                          </p>
                        ) : null}
                        <ul className="space-y-1">
                          {bloco.nomes.map((n, ni) => (
                            <li
                              key={`${bloco.titulo}-${ni}-${n}`}
                              className="text-sm font-medium text-slate-800"
                            >
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-500">
                    Não há totais em reais neste modo.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Resumo por categoria
                  </p>
                  <ul className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    {linhas.map((l, idx) => (
                      <li
                        key={`${idx}-${l.nome}`}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 font-medium text-slate-800">
                          {l.nome}
                        </span>
                        <span className="shrink-0 tabular-nums font-semibold text-slate-700">
                          {formatarMoedaBRL(l.total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-blue-950">
                    <span>Total</span>
                    <span className="tabular-nums">{formatarMoedaBRL(total)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={onFechar}
                  className="min-h-[48px] flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmar}
                  className="min-h-[48px] flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-base font-semibold text-white shadow-md shadow-emerald-500/25 transition active:scale-[0.98]"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
