import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { Categoria, UnidadeLista } from "../types/item";

export type EscolhaCategoria = {
  categoriaIdExistente: string | null;
  novaCategoriaTitulo: string | null;
  unidadeLista: UnidadeLista;
};

type Props = {
  aberto: boolean;
  nomeItem: string;
  categorias: Categoria[];
  onFechar: () => void;
  onConfirmar: (escolha: EscolhaCategoria) => void;
};

export function ModalCategoriaNovoItem({
  aberto,
  nomeItem,
  categorias,
  onFechar,
  onConfirmar,
}: Props) {
  const tituloId = useId();
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [unidadeLista, setUnidadeLista] = useState<UnidadeLista>("un");

  useEffect(() => {
    if (aberto) {
      setCategoriaId("");
      setNovaCategoria("");
      setUnidadeLista("un");
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

  const categoriasOrdenadas = [...categorias].sort(
    (a, b) => a.criadoEm - b.criadoEm,
  );

  function confirmar() {
    const nova = novaCategoria.trim();
    if (nova) {
      onConfirmar({
        categoriaIdExistente: null,
        novaCategoriaTitulo: nova,
        unidadeLista,
      });
      onFechar();
      return;
    }
    onConfirmar({
      categoriaIdExistente: categoriaId || null,
      novaCategoriaTitulo: null,
      unidadeLista,
    });
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
            className="relative z-10 flex max-h-[min(88dvh,600px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-blue-950"
              >
                Adicionar à categoria
              </h2>
              <p className="mt-2 rounded-xl bg-blue-50/80 px-3 py-2 text-sm font-medium text-blue-950">
                {nomeItem}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Defina como a quantidade será informada no mercado e, em seguida,
                a categoria.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de quantidade
                </legend>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Tipo de quantidade na lista do mercado"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={unidadeLista === "un"}
                    onClick={() => setUnidadeLista("un")}
                    className={[
                      "flex flex-col gap-1 rounded-2xl border-2 px-3 py-3 text-left transition",
                      unidadeLista === "un"
                        ? "border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span className="text-sm font-bold text-blue-950">UN</span>
                    <span className="text-[11px] leading-snug text-slate-600">
                      Unidade — quantidade em números inteiros (ex.: 2 caixas).
                    </span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={unidadeLista === "kg"}
                    onClick={() => setUnidadeLista("kg")}
                    className={[
                      "flex flex-col gap-1 rounded-2xl border-2 px-3 py-3 text-left transition",
                      unidadeLista === "kg"
                        ? "border-amber-500 bg-amber-50/90 shadow-sm ring-1 ring-amber-200"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span className="text-sm font-bold text-amber-950">Kg</span>
                    <span className="text-[11px] leading-snug text-slate-600">
                      Quilos — peso estimado (ex.: 1,5 kg de tomate).
                    </span>
                  </button>
                </div>
              </fieldset>

              <div className="space-y-2">
                <label
                  htmlFor="select-categoria-item"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Categoria existente
                </label>
                <select
                  id="select-categoria-item"
                  value={categoriaId}
                  disabled={novaCategoria.trim().length > 0}
                  onChange={(e) => {
                    setCategoriaId(e.target.value);
                  }}
                  className="min-h-[48px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sem categoria</option>
                  {categoriasOrdenadas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="nova-categoria-item"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Ou nova categoria
                </label>
                <input
                  id="nova-categoria-item"
                  type="text"
                  value={novaCategoria}
                  placeholder="Ex.: Frutas e verduras"
                  onChange={(e) => {
                    setNovaCategoria(e.target.value);
                    if (e.target.value.trim()) setCategoriaId("");
                  }}
                  className="min-h-[48px] w-full rounded-xl border-2 border-blue-100 bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
                {novaCategoria.trim() ? (
                  <p className="text-xs text-slate-500">
                    O nome acima será usado como nova categoria (prioridade sobre
                    a lista).
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
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
                className="min-h-[48px] flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-[0.98]"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
