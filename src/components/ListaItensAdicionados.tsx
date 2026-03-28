import { motion } from "framer-motion";
import type { Categoria, ItemCompra } from "../types/item";

type Props = {
  itens: ItemCompra[];
  categorias: Categoria[];
  disabled?: boolean;
  onEditar: (id: string) => void;
  onExcluir: (id: string) => void;
};

function tituloCategoria(
  categorias: Categoria[],
  categoriaId: string | null | undefined,
): string {
  if (!categoriaId) return "Sem categoria";
  const c = categorias.find((x) => x.id === categoriaId);
  return c?.titulo ?? "Sem categoria";
}

/** Mais recentes no topo (último adicionado primeiro). */
function ordenarMaisRecentesPrimeiro(itens: ItemCompra[]): ItemCompra[] {
  return [...itens].sort((a, b) => b.criadoEm - a.criadoEm);
}

export function ListaItensAdicionados({
  itens,
  categorias,
  disabled = false,
  onEditar,
  onExcluir,
}: Props) {
  const ordenados = ordenarMaisRecentesPrimeiro(itens);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 px-0.5">
        <h3 className="text-base font-bold text-blue-950">Itens adicionados</h3>
        <span className="text-sm font-medium text-slate-500">
          {itens.length}{" "}
          {itens.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {itens.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-8 text-center text-sm text-slate-600">
          Nenhum item na lista ainda. Digite acima e toque em Adicionar.
        </p>
      ) : (
        <ul
          className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto overscroll-contain pr-0.5"
          aria-label="Lista de todos os itens cadastrados"
        >
          {ordenados.map((item) => {
            const cat = tituloCategoria(categorias, item.categoriaId);

            return (
              <motion.li
                key={item.id}
                layout
                initial={false}
                className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{item.nome}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-xs text-slate-500">{cat}</p>
                      {item.unidadeLista === "kg" ? (
                        <span className="rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Kg
                        </span>
                      ) : (
                        <span className="rounded-md bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                          UN
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEditar(item.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200/90 bg-blue-50/90 text-blue-800 transition enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Editar ${item.nome}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onExcluir(item.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200/90 bg-red-50/90 text-red-800 transition enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Excluir ${item.nome}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
