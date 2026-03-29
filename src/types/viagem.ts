import type { CompraFinalizada } from "./balanco";
import type { Categoria, ItemCompra } from "./item";

/** Uma lista de compras nomeada (viagem à loja, feira, etc.), com dados e histórico próprios. */
export interface ViagemLista {
  id: string;
  nome: string;
  criadoEm: number;
  categorias: Categoria[];
  itens: ItemCompra[];
  ordemCorredoresCategoriaIds: string[];
  comprasFinalizadas: CompraFinalizada[];
  /** Limite em reais (R$) para esta lista na ida ao mercado — só usado na lista completa. */
  orcamentoReais?: number | null;
}
