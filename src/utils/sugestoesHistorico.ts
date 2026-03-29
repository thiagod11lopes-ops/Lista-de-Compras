import type { CompraFinalizada } from "../types/balanco";
import { normalizarParaComparacao } from "./duplicados";

const MAX_AUTO = 8;
const MAX_JUNTO = 5;

export type IndiceHistoricoCompras = {
  /** Nome normalizado → texto de exibição (última ocorrência no histórico). */
  nomePorNorm: Map<string, string>;
  /** Coocorrência na mesma finalização (chaves normalizadas). */
  cooc: Map<string, Map<string, number>>;
};

/** Agrega nomes e pares de itens comprados na mesma finalização (todas as listas). */
export function construirIndiceHistorico(
  compras: CompraFinalizada[],
): IndiceHistoricoCompras {
  const nomePorNorm = new Map<string, string>();
  for (let i = compras.length - 1; i >= 0; i--) {
    for (const linha of compras[i].itens) {
      const n = normalizarParaComparacao(linha.nome);
      if (!n) continue;
      if (!nomePorNorm.has(n)) nomePorNorm.set(n, linha.nome.trim());
    }
  }

  const cooc = new Map<string, Map<string, number>>();

  function addCooc(a: string, b: string) {
    if (a === b) return;
    for (const x of [a, b]) {
      const y = x === a ? b : a;
      if (!cooc.has(x)) cooc.set(x, new Map());
      const m = cooc.get(x)!;
      m.set(y, (m.get(y) ?? 0) + 1);
    }
  }

  for (const c of compras) {
    const norms = [
      ...new Set(
        c.itens
          .map((i) => normalizarParaComparacao(i.nome))
          .filter(Boolean),
      ),
    ];
    for (let i = 0; i < norms.length; i++) {
      for (let j = i + 1; j < norms.length; j++) {
        addCooc(norms[i], norms[j]);
      }
    }
  }

  return { nomePorNorm, cooc };
}

export type SugestoesHistorico = {
  autocomplete: string[];
  costumaJunto: {
    ancoragemExibicao: string;
    itens: string[];
  } | null;
};

/**
 * Autocomplete por prefixo e sugestões “costuma ir junto” a partir do histórico de finalizações.
 */
export function obterSugestoesHistorico(
  indice: IndiceHistoricoCompras,
  prefixoRaw: string,
  nomesJaNaListaNorm: Set<string>,
): SugestoesHistorico {
  const p = normalizarParaComparacao(prefixoRaw);
  if (!p) {
    return { autocomplete: [], costumaJunto: null };
  }

  const { nomePorNorm, cooc } = indice;

  const candidatos: string[] = [];
  for (const [norm, display] of nomePorNorm) {
    if (!norm.startsWith(p)) continue;
    if (nomesJaNaListaNorm.has(norm)) continue;
    candidatos.push(display);
  }

  candidatos.sort((a, b) => {
    const na = normalizarParaComparacao(a);
    const nb = normalizarParaComparacao(b);
    if (na.length !== nb.length) return na.length - nb.length;
    return a.localeCompare(b, "pt");
  });

  const autocomplete = candidatos.slice(0, MAX_AUTO);

  let anchorNorm: string | null = null;
  if (nomePorNorm.has(p)) {
    anchorNorm = p;
  } else {
    let best: string | null = null;
    let bestLen = -1;
    for (const norm of nomePorNorm.keys()) {
      if (!norm.startsWith(p)) continue;
      if (norm.length > bestLen) {
        bestLen = norm.length;
        best = norm;
      }
    }
    anchorNorm = best;
  }

  let costumaJunto: SugestoesHistorico["costumaJunto"] = null;

  if (anchorNorm && p.length >= 2) {
    const neighbors = cooc.get(anchorNorm);
    if (neighbors && neighbors.size > 0) {
      const pairs = [...neighbors.entries()].sort((a, b) => b[1] - a[1]);
      const itens: string[] = [];
      for (const [neighborNorm] of pairs) {
        if (nomesJaNaListaNorm.has(neighborNorm)) continue;
        const disp = nomePorNorm.get(neighborNorm);
        if (disp) itens.push(disp);
        if (itens.length >= MAX_JUNTO) break;
      }
      if (itens.length > 0) {
        costumaJunto = {
          ancoragemExibicao: nomePorNorm.get(anchorNorm) ?? anchorNorm,
          itens,
        };
      }
    }
  }

  return { autocomplete, costumaJunto };
}
