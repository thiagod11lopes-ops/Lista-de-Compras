import type { CompraFinalizada, ItemCompraFinalizada } from "../types/balanco";
import type { Categoria, ItemCompra } from "../types/item";
import type { ViagemLista } from "../types/viagem";

const STORAGE_KEY_V1 = "lista-compras:v1";
const STORAGE_KEY_V2 = "lista-compras:v2";
const STORAGE_KEY_V3 = "lista-compras:v3";

/** Estado persistido: várias listas nomeadas (viagens) com histórico de balanço cada uma. */
export type EstadoLista = {
  viagens: ViagemLista[];
  viagemAtivaId: string;
};

type EstadoLegadoFlat = {
  categorias: Categoria[];
  itens: ItemCompra[];
  comprasFinalizadas: CompraFinalizada[];
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

function isEstadoLegadoFlat(value: unknown): value is EstadoLegadoFlat {
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

function isViagemLista(value: unknown): value is ViagemLista {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.nome !== "string" ||
    typeof o.criadoEm !== "number"
  ) {
    return false;
  }
  if (!Array.isArray(o.categorias) || !o.categorias.every(isCategoria)) {
    return false;
  }
  if (!Array.isArray(o.itens) || !o.itens.every(isItemCompra)) {
    return false;
  }
  if (
    o.ordemCorredoresCategoriaIds !== undefined &&
    !isOrdemCorredores(o.ordemCorredoresCategoriaIds)
  ) {
    return false;
  }
  if (!Array.isArray(o.comprasFinalizadas)) return false;
  if (
    o.orcamentoReais !== undefined &&
    o.orcamentoReais !== null &&
    (typeof o.orcamentoReais !== "number" ||
      !Number.isFinite(o.orcamentoReais) ||
      o.orcamentoReais < 0)
  ) {
    return false;
  }
  return o.comprasFinalizadas.every(isCompraFinalizada);
}

function isEstadoV3(value: unknown): value is EstadoLista {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.viagemAtivaId !== "string") return false;
  if (!Array.isArray(o.viagens) || !o.viagens.every(isViagemLista)) {
    return false;
  }
  if (o.viagens.length === 0) {
    return o.viagemAtivaId === "";
  }
  return o.viagens.some((v) => v.id === o.viagemAtivaId);
}

function migrarFlatParaV3(legado: EstadoLegadoFlat): EstadoLista {
  const id = crypto.randomUUID();
  return {
    viagemAtivaId: id,
    viagens: [
      {
        id,
        nome: "Lista",
        criadoEm: Date.now(),
        categorias: legado.categorias,
        itens: legado.itens,
        ordemCorredoresCategoriaIds: legado.ordemCorredoresCategoriaIds ?? [],
        comprasFinalizadas: legado.comprasFinalizadas ?? [],
      },
    ],
  };
}

export function criarEstadoVazio(): EstadoLista {
  const id = crypto.randomUUID();
  return {
    viagemAtivaId: id,
    viagens: [
      {
        id,
        nome: "",
        criadoEm: Date.now(),
        categorias: [],
        itens: [],
        ordemCorredoresCategoriaIds: [],
        comprasFinalizadas: [],
      },
    ],
  };
}

/** Garante estrutura mínima após JSON antigo ou dados corrompidos. */
export function garantirEstadoValido(raw: EstadoLista): EstadoLista {
  if (!raw?.viagens || !Array.isArray(raw.viagens)) {
    return criarEstadoVazio();
  }
  if (raw.viagens.length === 0) {
    return criarEstadoVazio();
  }
  const ativa = raw.viagemAtivaId;
  if (!ativa || !raw.viagens.some((v) => v.id === ativa)) {
    return { ...raw, viagemAtivaId: raw.viagens[0].id };
  }
  return raw;
}

/**
 * Persistência web via localStorage.
 * Para React Native, substitua o corpo mantendo a mesma assinatura async.
 */
export async function carregarEstado(): Promise<EstadoLista> {
  if (typeof window === "undefined") {
    return criarEstadoVazio();
  }
  try {
    const rawV3 = window.localStorage.getItem(STORAGE_KEY_V3);
    if (rawV3) {
      const parsed: unknown = JSON.parse(rawV3);
      if (isEstadoV3(parsed)) {
        return garantirEstadoValido(parsed);
      }
    }

    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      if (isEstadoLegadoFlat(parsed)) {
        const next = garantirEstadoValido(migrarFlatParaV3(parsed));
        void salvarEstado(next);
        try {
          window.localStorage.removeItem(STORAGE_KEY_V2);
        } catch {
          /* */
        }
        return garantirEstadoValido(next);
      }
    }

    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed: unknown = JSON.parse(rawV1);
      if (Array.isArray(parsed)) {
        const itens = parsed.filter(isItemCompra);
        const next = migrarFlatParaV3({
          categorias: [],
          itens,
          comprasFinalizadas: [],
        });
        void salvarEstado(garantirEstadoValido(next));
        return garantirEstadoValido(next);
      }
    }
  } catch {
    /* ignore */
  }
  return criarEstadoVazio();
}

export async function salvarEstado(estado: EstadoLista): Promise<void> {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(estado);
  window.localStorage.setItem(STORAGE_KEY_V3, json);
}
