import { AnimatePresence, motion } from "framer-motion";
import type { Categoria, ItemCompra } from "../types/item";
import { blocosPorCategoria } from "../utils/agruparItens";
import { ItemFaltando } from "./ItemFaltando";

type Props = {
  itens: ItemCompra[];
  categorias: Categoria[];
  ordemCorredoresCategoriaIds?: string[] | null;
  onAlternarListaMercado: (id: string) => void;
};

export function ListaFaltando({
  itens,
  categorias,
  ordemCorredoresCategoriaIds,
  onAlternarListaMercado,
}: Props) {
  const blocos = blocosPorCategoria(
    itens,
    categorias,
    ordemCorredoresCategoriaIds,
  );

  return (
    <section className="space-y-3" aria-labelledby="titulo-faltando">
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl" aria-hidden>
          ⚠️
        </span>
        <h2
          id="titulo-faltando"
          className="text-lg font-bold tracking-tight text-blue-950"
        >
          Comprar Novamente
        </h2>
      </div>
      <p className="px-1 text-sm text-slate-600">
        Marque para enviar o item à Lista do Mercado (fica opaco aqui; desmarque para
        voltar).
      </p>
      {itens.length === 0 ? (
        <motion.p
          layout
          className="rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50/50 px-4 py-8 text-center text-sm text-emerald-900/80"
        >
          Nenhum item aqui ainda — marque itens como comprados na Lista do Mercado.
        </motion.p>
      ) : (
        <div className="space-y-6">
          {blocos.map((bloco) => (
            <div key={bloco.categoriaId ?? "todos-f"} className="space-y-2">
              {bloco.titulo ? (
                <h3 className="px-1 text-sm font-semibold uppercase tracking-wide text-amber-900/85">
                  {bloco.titulo}
                </h3>
              ) : null}
              <motion.ul className="space-y-2" layout>
                <AnimatePresence initial={false} mode="popLayout">
                  {bloco.itens.map((item) => (
                    <ItemFaltando
                      key={item.id}
                      item={item}
                      onAlternarListaMercado={onAlternarListaMercado}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
