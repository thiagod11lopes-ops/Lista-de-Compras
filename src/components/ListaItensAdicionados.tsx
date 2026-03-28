import { motion } from "framer-motion";
import type { Categoria, ItemCompra } from "../types/item";

type Props = {
  itens: ItemCompra[];
  categorias: Categoria[];
};

function tituloCategoria(
  categorias: Categoria[],
  categoriaId: string | null | undefined,
): string {
  if (!categoriaId) return "Sem categoria";
  const c = categorias.find((x) => x.id === categoriaId);
  return c?.titulo ?? "Sem categoria";
}

function ordenarPorAdicao(itens: ItemCompra[]): ItemCompra[] {
  return [...itens].sort((a, b) => a.criadoEm - b.criadoEm);
}

export function ListaItensAdicionados({ itens, categorias }: Props) {
  const ordenados = ordenarPorAdicao(itens);

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
                  <span
                    className={[
                      "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      item.comprado
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-900",
                    ].join(" ")}
                  >
                    {item.comprado ? "Marcado" : "Pendente"}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
