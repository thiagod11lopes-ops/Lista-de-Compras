import type { Categoria, ItemCompra } from "../types/item";
import { blocosPorCategoria } from "./agruparItens";

export function precoPreenchido(item: ItemCompra): boolean {
  const u = item.preco;
  return typeof u === "number" && Number.isFinite(u);
}

export function quantidadePreenchida(item: ItemCompra): boolean {
  const q = item.quantidade;
  return typeof q === "number" && Number.isFinite(q) && q > 0;
}

export function podeMarcarComoComprado(item: ItemCompra): boolean {
  return precoPreenchido(item) && quantidadePreenchida(item);
}

/** Subtotal = preço unitário × quantidade (só quando ambos preenchidos). */
export function subtotalLinhaMercado(item: ItemCompra): number | null {
  if (!precoPreenchido(item) || !quantidadePreenchida(item)) return null;
  const u = item.preco as number;
  const q = item.quantidade as number;
  return Math.round(u * q * 100) / 100;
}

/** Linhas dos itens marcados comprados — mesma regra do balanço (qtd padrão 1 se vazia). */
export function linhasTotaisComprados(itens: ItemCompra[]): {
  nome: string;
  total: number | null;
}[] {
  return itens
    .filter((i) => i.comprado)
    .map((i) => {
      const u =
        typeof i.preco === "number" && Number.isFinite(i.preco)
          ? i.preco
          : null;
      const q = quantidadePreenchida(i) ? (i.quantidade as number) : 1;
      const linhaTotal =
        u != null ? Math.round(u * q * 100) / 100 : null;
      return { nome: i.nome, total: linhaTotal };
    });
}

export function somaTotaisLinhas(
  linhas: { total: number | null }[],
): number {
  const t = linhas.reduce((acc, l) => acc + (l.total ?? 0), 0);
  return Math.round(t * 100) / 100;
}

/**
 * Soma dos valores dos itens marcados como comprados, agrupada por categoria
 * (mesma ordem e rótulos de `blocosPorCategoria`).
 */
export function linhasTotaisCompradosPorCategoria(
  itens: ItemCompra[],
  categorias: Categoria[],
  ordemCorredoresCategoriaIds?: string[] | null,
): { nome: string; total: number }[] {
  const blocos = blocosPorCategoria(
    itens,
    categorias,
    ordemCorredoresCategoriaIds,
  );
  const linhas: { nome: string; total: number }[] = [];

  for (const bloco of blocos) {
    const comprados = bloco.itens.filter((i) => i.comprado);
    if (comprados.length === 0) continue;

    const linhasItens = linhasTotaisComprados(comprados);
    const total = somaTotaisLinhas(linhasItens);
    const nome =
      bloco.titulo.trim() ||
      (categorias.length === 0 ? "Itens" : "Sem categoria");
    linhas.push({ nome, total });
  }

  return linhas;
}
