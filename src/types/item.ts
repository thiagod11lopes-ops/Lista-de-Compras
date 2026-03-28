/** Como a quantidade será tratada na lista do mercado (definido ao adicionar o item). */
export type UnidadeLista = "un" | "kg";

export interface Categoria {
  id: string;
  titulo: string;
  criadoEm: number;
}

export interface ItemCompra {
  id: string;
  nome: string;
  comprado: boolean;
  /** Ordem de adição (timestamp) */
  criadoEm: number;
  /** Grupo / tipo (ex.: frutas e verduras) */
  categoriaId?: string | null;
  /** Preço unitário na lista do mercado (BRL) */
  preco?: number | null;
  /** Quantidade (padrão 1). Subtotal = preço unitário × quantidade */
  quantidade?: number;
  /** UN = por unidade (número); kg = peso estimado em quilos */
  unidadeLista?: UnidadeLista;
  /** Após “Finalizar compras”: some da Lista do Mercado, permanece nas outras abas */
  excluidoDoMercado?: boolean;
  /** Enviado desta aba de volta ao mercado: linha fica opaca e continua listada aqui */
  retiradoParaMercadoNovamente?: boolean;
}
