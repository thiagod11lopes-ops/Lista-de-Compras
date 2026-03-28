import type { CompraFinalizada, ItemCompraFinalizada } from "../types/balanco";
import type { Categoria, ItemCompra } from "../types/item";

const STORAGE_KEY_V1 = "lista-compras:v1";
const STORAGE_KEY_V2 = "lista-compras:v2";

export type EstadoLista = {
  categorias: Categoria[];
  itens: ItemCompra[];
  comprasFinalizadas: CompraFinalizada[];
  /** Ordem dos corredores (IDs de categoria) na loja habitual — Lista do Mercado segue esta ordem. */
  ordemCorredoresCategoriaIds?: string[];
};

function isItemCompra(value: unknown): value is ItemCompra {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const catOk =
    o.categoriaId === undefined ||
    o.categoriaId === null ||
    typeof o.categoriaId === "string";
  const precoOk =
    o.preco === undefined ||
    o.preco === null ||
    (typeof o.preco === "number" && Number.isFinite(o.preco));
  const qtdOk =
    o.quantidade === undefined ||
    (typeof o.quantidade === "number" &&
      Number.isFinite(o.quantidade) &&
      o.quantidade > 0);
  const unListaOk =
    o.unidadeLista === undefined ||
    o.unidadeLista === "un" ||
    o.unidadeLista === "kg";
  const exclMercadoOk =
    o.excluidoDoMercado === undefined ||
    typeof o.excluidoDoMercado === "boolean";
  const retiradoOk =
    o.retiradoParaMercadoNovamente === undefined ||
    typeof o.retiradoParaMercadoNovamente === "boolean";
  return (
    typeof o.id === "string" &&
    typeof o.nome === "string" &&
    typeof o.comprado === "boolean" &&
    typeof o.criadoEm === "number" &&
    catOk &&
    precoOk &&
    qtdOk &&
    unListaOk &&
    exclMercadoOk &&
    retiradoOk
  );
}

function isCategoria(value: unknown): value is Categoria {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.titulo === "string" &&
    typeof o.criadoEm === "number"
  );
}

function isLinhaCompraFinalizada(value: unknown): value is ItemCompraFinalizada {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const precoOk =
    o.preco === undefined ||
    o.preco === null ||
    (typeof o.preco === "number" && Number.isFinite(o.preco));
  return typeof o.nome === "string" && precoOk;
}

function isCompraFinalizada(value: unknown): value is CompraFinalizada {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.finalizadaEm !== "number" ||
    typeof o.total !== "number" ||
    !Array.isArray(o.itens)
  ) {
    return false;
  }
  if (
    o.tipoLista !== undefined &&
    o.tipoLista !== "completa" &&
    o.tipoLista !== "simples"
  ) {
    return false;
  }
  return o.itens.every(isLinhaCompraFinalizada);
}

function isOrdemCorredores(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function isEstadoV2(value: unknown): value is EstadoLista {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (!Array.isArray(o.itens) || !Array.isArray(o.categorias)) return false;
  if (!o.itens.every(isItemCompra) || !o.categorias.every(isCategoria)) {
    return false;
  }
  if (
    o.ordemCorredoresCategoriaIds !== undefined &&
    !isOrdemCorredores(o.ordemCorredoresCategoriaIds)
  ) {
    return false;
  }
  if (o.comprasFinalizadas === undefined) {
    return true;
  }
  if (!Array.isArray(o.comprasFinalizadas)) return false;
  return o.comprasFinalizadas.every(isCompraFinalizada);
}

/**
 * Persistência web via localStorage.
 * Para React Native, substitua o corpo mantendo a mesma assinatura async.
 */
export async function carregarEstado(): Promise<EstadoLista> {
  if (typeof window === "undefined") {
    return { categorias: [], itens: [], comprasFinalizadas: [] };
  }
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      if (isEstadoV2(parsed)) {
        return {
          categorias: parsed.categorias,
          itens: parsed.itens,
          comprasFinalizadas: parsed.comprasFinalizadas ?? [],
          ordemCorredoresCategoriaIds: parsed.ordemCorredoresCategoriaIds,
        };
      }
    }

    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed: unknown = JSON.parse(rawV1);
      if (Array.isArray(parsed)) {
        const itens = parsed.filter(isItemCompra);
        return { categorias: [], itens, comprasFinalizadas: [] };
      }
    }
  } catch {
    /* ignore */
  }
  return { categorias: [], itens: [], comprasFinalizadas: [] };
}

export async function salvarEstado(estado: EstadoLista): Promise<void> {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(estado);
  window.localStorage.setItem(STORAGE_KEY_V2, json);
}
