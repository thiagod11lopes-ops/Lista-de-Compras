import type { Categoria, ItemCompra } from "../types/item";

/** Compara nomes sem diferenciar maiúsculas ou espaços repetidos. */
export function normalizarParaComparacao(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function nomeItemJaExiste(
  itens: ItemCompra[],
  nome: string,
  excluirId?: string,
): boolean {
  const n = normalizarParaComparacao(nome);
  if (!n) return false;
  return itens.some(
    (i) => i.id !== excluirId && normalizarParaComparacao(i.nome) === n,
  );
}

export function tituloCategoriaJaExiste(
  categorias: Categoria[],
  titulo: string,
  excluirId?: string,
): boolean {
  const t = normalizarParaComparacao(titulo);
  if (!t) return false;
  return categorias.some(
    (c) => c.id !== excluirId && normalizarParaComparacao(c.titulo) === t,
  );
}
