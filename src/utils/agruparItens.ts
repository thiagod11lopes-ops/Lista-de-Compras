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

/**
 * Ordem das categorias na loja: primeiro corredor = início da lista.
 * Categorias novas (fora da lista guardada) entram no fim, por data de criação.
 */
export function ordenarCategoriasParaMercado(
  categorias: Categoria[],
  ordemCorredoresCategoriaIds: string[] | null | undefined,
): Categoria[] {
  if (categorias.length === 0) return [];
  if (!ordemCorredoresCategoriaIds?.length) {
    return [...categorias].sort((a, b) => a.criadoEm - b.criadoEm);
  }
  const map = new Map(categorias.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const result: Categoria[] = [];
  for (const id of ordemCorredoresCategoriaIds) {
    const c = map.get(id);
    if (c) {
      result.push(c);
      seen.add(id);
    }
  }
  const rest = categorias
    .filter((c) => !seen.has(c.id))
    .sort((a, b) => a.criadoEm - b.criadoEm);
  return [...result, ...rest];
}

export type BlocoLista = {
  titulo: string;
  categoriaId: string | null;
  itens: ItemCompra[];
};

/**
 * Monta blocos por categoria. `ordemCorredoresCategoriaIds` define a ordem dos corredores
 * (loja habitual); se vazio/indefinido, usa ordem de criação das categorias.
 * Itens sem grupo ficam em "Sem categoria" no fim.
 */
export function blocosPorCategoria(
  itens: ItemCompra[],
  categorias: Categoria[],
  ordemCorredoresCategoriaIds?: string[] | null,
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

  const ordenadas = ordenarCategoriasParaMercado(
    categorias,
    ordemCorredoresCategoriaIds,
  );
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
