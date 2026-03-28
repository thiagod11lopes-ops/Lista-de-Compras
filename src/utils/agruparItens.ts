import type { Categoria, ItemCompra } from "../types/item";

function ordenarPorAdicao(itens: ItemCompra[]): ItemCompra[] {
  return [...itens].sort((a, b) => a.criadoEm - b.criadoEm);
}

/** Pendentes no topo; marcados (checkbox) na base, por ordem de criação. */
export function ordenarItensNoBlocoMercado(itens: ItemCompra[]): ItemCompra[] {
  const pendentes = ordenarPorAdicao(itens.filter((i) => !i.comprado));
  const marcados = ordenarPorAdicao(itens.filter((i) => i.comprado));
  return [...pendentes, ...marcados];
}

export type BlocoLista = {
  titulo: string;
  categoriaId: string | null;
  itens: ItemCompra[];
};

/**
 * Monta blocos por categoria (ordem de criação). Itens sem grupo ficam em "Sem categoria"
 * só quando existe pelo menos uma categoria no app.
 */
export function blocosPorCategoria(
  itens: ItemCompra[],
  categorias: Categoria[],
): BlocoLista[] {
  const idsValidos = new Set(categorias.map((c) => c.id));

  if (categorias.length === 0) {
    if (itens.length === 0) return [];
    return [
      {
        titulo: "",
        categoriaId: null,
        itens: ordenarItensNoBlocoMercado(itens),
      },
    ];
  }

  const ordenadas = [...categorias].sort((a, b) => a.criadoEm - b.criadoEm);
  const blocos: BlocoLista[] = [];

  for (const c of ordenadas) {
    const grupo = itens.filter((i) => i.categoriaId === c.id);
    if (grupo.length > 0) {
      blocos.push({
        titulo: c.titulo,
        categoriaId: c.id,
        itens: ordenarItensNoBlocoMercado(grupo),
      });
    }
  }

  const sem = itens.filter(
    (i) => !i.categoriaId || !idsValidos.has(i.categoriaId),
  );
  if (sem.length > 0) {
    blocos.push({
      titulo: "Sem categoria",
      categoriaId: null,
      itens: ordenarItensNoBlocoMercado(sem),
    });
  }

  return blocos;
}
