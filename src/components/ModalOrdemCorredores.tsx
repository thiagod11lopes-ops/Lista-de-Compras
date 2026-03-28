import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";
import type { Categoria } from "../types/item";

type Props = {
  aberto: boolean;
  categorias: Categoria[];
  ordemAtualIds: string[];
  onFechar: () => void;
  onSalvar: (ids: string[]) => void;
};

export function ModalOrdemCorredores({
  aberto,
  categorias,
  ordemAtualIds,
  onFechar,
  onSalvar,
}: Props) {
  const tituloId = useId();
  const [ordemLocal, setOrdemLocal] = useState<string[]>([]);

  useEffect(() => {
    if (!aberto) return;
    const valid = new Set(categorias.map((c) => c.id));
    const filtered = ordemAtualIds.filter((id) => valid.has(id));
    const inFiltered = new Set(filtered);
    const missing = categorias
      .filter((c) => !inFiltered.has(c.id))
      .sort((a, b) => a.criadoEm - b.criadoEm)
      .map((c) => c.id);
    setOrdemLocal([...filtered, ...missing]);
  }, [aberto, ordemAtualIds, categorias]);

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

  const tituloPorId = useCallback(
    (id: string) => categorias.find((c) => c.id === id)?.titulo ?? id,
    [categorias],
  );

  const mover = useCallback((index: number, delta: -1 | 1) => {
    setOrdemLocal((prev) => {
      const j = index + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }, []);

  const restaurarOrdemCriacao = useCallback(() => {
    setOrdemLocal(
      [...categorias]
        .sort((a, b) => a.criadoEm - b.criadoEm)
        .map((c) => c.id),
    );
  }, [categorias]);

  const salvar = useCallback(() => {
    onSalvar(ordemLocal);
    onFechar();
  }, [ordemLocal, onSalvar, onFechar]);

  const temCategorias = categorias.length > 0;

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-[55] flex items-end justify-center p-4 sm:items-center"
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
            aria-labelledby={tituloId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex max-h-[min(88dvh,560px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-blue-950"
              >
                Ordem dos corredores
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Defina a ordem da sua loja habitual: o primeiro grupo é o que
                aparece no topo da Lista do Mercado (como ao entrar e seguir os
                corredores). &quot;Sem categoria&quot; continua sempre por
                último.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {!temCategorias ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
                  Crie categorias ao adicionar ou agrupar itens para poder
                  ordenar os corredores.
                </p>
              ) : (
                <ul className="space-y-2" aria-label="Ordem dos grupos">
                  {ordemLocal.map((id, index) => (
                    <li
                      key={id}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-900">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 font-medium text-slate-900">
                        {tituloPorId(id)}
                      </span>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => mover(index, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition enabled:active:scale-95 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Mover ${tituloPorId(id)} para cima`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === ordemLocal.length - 1}
                          onClick={() => mover(index, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition enabled:active:scale-95 enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Mover ${tituloPorId(id)} para baixo`}
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              {temCategorias ? (
                <button
                  type="button"
                  onClick={restaurarOrdemCriacao}
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition active:scale-[0.99]"
                >
                  Restaurar ordem de criação
                </button>
              ) : null}
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
                  disabled={!temCategorias}
                  onClick={salvar}
                  className="min-h-[48px] flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-semibold text-white shadow-md shadow-blue-500/25 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Guardar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
