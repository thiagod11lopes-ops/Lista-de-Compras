import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";
import type { ItemCompra } from "../types/item";

type Props = {
  aberto: boolean;
  itens: ItemCompra[];
  onFechar: () => void;
  /** Devolva `false` para não fechar (ex.: categoria duplicada). */
  onConfirmar: (titulo: string, idsSelecionados: string[]) => boolean | void;
};

export function ModalAgruparTipo({
  aberto,
  itens,
  onFechar,
  onConfirmar,
}: Props) {
  const tituloDialogId = useId();
  const [titulo, setTitulo] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [erroTitulo, setErroTitulo] = useState(false);
  const [erroItens, setErroItens] = useState(false);

  useEffect(() => {
    if (aberto) {
      setTitulo("");
      setSelecionados(new Set());
      setErroTitulo(false);
      setErroItens(false);
    }
  }, [aberto]);

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

  const alternar = useCallback((id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setErroItens(false);
  }, []);

  const selecionarTodos = useCallback(() => {
    setSelecionados(new Set(itens.map((i) => i.id)));
    setErroItens(false);
  }, [itens]);

  const limparSelecao = useCallback(() => {
    setSelecionados(new Set());
  }, []);

  const confirmar = useCallback(() => {
    const t = titulo.trim();
    if (!t) {
      setErroTitulo(true);
      return;
    }
    if (selecionados.size === 0) {
      setErroItens(true);
      return;
    }
    const ok = onConfirmar(t, [...selecionados]);
    if (ok !== false) onFechar();
  }, [titulo, selecionados, onConfirmar, onFechar]);

  const n = selecionados.size;

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
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloDialogId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex max-h-[min(85dvh,580px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloDialogId}
                className="text-lg font-bold text-blue-950"
              >
                Agrupar por tipo
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Dê um nome ao grupo e marque os itens da lista que entram nele
                (ex.: Frutas e verduras).
              </p>
            </div>

            <div className="shrink-0 space-y-2 px-5 pt-4">
              <label htmlFor="titulo-grupo" className="sr-only">
                Título do grupo
              </label>
              <input
                id="titulo-grupo"
                type="text"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (erroTitulo) setErroTitulo(false);
                }}
                placeholder="Ex.: Frutas e verduras"
                className={[
                  "min-h-[48px] w-full rounded-2xl border-2 bg-white px-4 text-base outline-none transition",
                  erroTitulo
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                ].join(" ")}
              />
              {erroTitulo ? (
                <p className="text-sm font-medium text-red-600" role="status">
                  Informe um título para o grupo.
                </p>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {itens.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  Adicione itens à lista antes de agrupar.
                </p>
              ) : (
                <>
                  <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Incluir na lista atual
                  </p>
                  <ul className="space-y-1">
                    {itens.map((item) => {
                      const marcado = selecionados.has(item.id);
                      return (
                        <li key={item.id}>
                          <label
                            className={[
                              "flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 transition-colors active:bg-slate-100",
                              marcado ? "bg-blue-50" : "hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={marcado}
                              onChange={() => alternar(item.id)}
                              className="h-5 w-5 shrink-0 rounded-md border-2 border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-300"
                            />
                            <span className="min-w-0 flex-1 font-medium text-slate-900">
                              {item.nome}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {erroItens ? (
                    <p
                      className="mt-2 px-2 text-sm font-medium text-red-600"
                      role="status"
                    >
                      Marque pelo menos um item para este grupo.
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  disabled={itens.length === 0}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition enabled:active:scale-[0.98] disabled:opacity-40"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={limparSelecao}
                  disabled={n === 0}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition enabled:active:scale-[0.98] disabled:opacity-40"
                >
                  Limpar seleção
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onFechar}
                  className="min-h-[48px] flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={itens.length === 0}
                  className="min-h-[48px] flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-semibold text-white shadow-md shadow-blue-500/25 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Criar grupo {n > 0 ? `(${n})` : ""}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
