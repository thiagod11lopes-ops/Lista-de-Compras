import type { ViagemLista } from "../types/viagem";

export function normalizarNomeViagem(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

/** Comparação insensível a maiúsculas e espaços extras. */
export function nomeViagemJaExiste(
  viagens: Pick<ViagemLista, "id" | "nome">[],
  nome: string,
  excluirId?: string,
): boolean {
  const alvo = normalizarNomeViagem(nome).toLowerCase();
  if (!alvo) return false;
  return viagens.some(
    (v) =>
      v.id !== excluirId &&
      normalizarNomeViagem(v.nome).toLowerCase() === alvo,
  );
}
