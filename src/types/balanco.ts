export interface ItemCompraFinalizada {
  nome: string;
  /** Valor da linha (preço unit. × quantidade) ou null se sem preço */
  preco: number | null;
}

/** Lista completa = com preço/qtd; lista simples = só checklist (sem dados para balanço em R$). */
export type TipoListaMercadoFinalizada = "completa" | "simples";

export interface CompraFinalizada {
  id: string;
  /** Quando o usuário tocou em Finalizar compras */
  finalizadaEm: number;
  itens: ItemCompraFinalizada[];
  /** Soma dos preços informados na finalização */
  total: number;
  /** Omitido em registros antigos = compra com valores (completa). */
  tipoLista?: TipoListaMercadoFinalizada;
}
