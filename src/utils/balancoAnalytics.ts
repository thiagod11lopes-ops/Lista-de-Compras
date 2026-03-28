import type { CompraFinalizada } from "../types/balanco";

export type GastoPorItem = {
  nomeExibicao: string;
  total: number;
  ocorrencias: number;
};

export type GastoPorMes = {
  chave: string;
  /** ex.: "mar. de 2026" */
  rotulo: string;
  total: number;
  compras: number;
};

export function mesChave(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function rotuloMesPtBr(chave: string): string {
  const [ys, ms] = chave.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return chave;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export function chaveMesAtual(): string {
  return mesChave(Date.now());
}

/** Soma do total de cada compra finalizada no mês da chave (YYYY-MM). */
export function totalNoMes(
  compras: CompraFinalizada[],
  mesAlvo: string,
): number {
  return compras
    .filter((c) => mesChave(c.finalizadaEm) === mesAlvo)
    .reduce((acc, c) => acc + c.total, 0);
}

export function gastoPorMes(compras: CompraFinalizada[]): GastoPorMes[] {
  const map = new Map<
    string,
    { total: number; compras: number }
  >();

  for (const c of compras) {
    const k = mesChave(c.finalizadaEm);
    const cur = map.get(k) ?? { total: 0, compras: 0 };
    cur.total += c.total;
    cur.compras += 1;
    map.set(k, cur);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, v]) => ({
      chave,
      rotulo: rotuloMesPtBr(chave),
      total: Math.round(v.total * 100) / 100,
      compras: v.compras,
    }));
}

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase();
}

/**
 * Agrega por nome do item (case-insensitive). Soma apenas linhas com preço.
 */
export function gastoPorItem(compras: CompraFinalizada[]): GastoPorItem[] {
  const map = new Map<
    string,
    { nomeExibicao: string; total: number; ocorrencias: number }
  >();

  for (const c of compras) {
    for (const linha of c.itens) {
      const key = normalizarNome(linha.nome);
      if (!key) continue;
      const cur =
        map.get(key) ?? {
          nomeExibicao: linha.nome.trim(),
          total: 0,
          ocorrencias: 0,
        };
      cur.ocorrencias += 1;
      if (linha.preco != null && Number.isFinite(linha.preco)) {
        cur.total += linha.preco;
      }
      map.set(key, cur);
    }
  }

  return [...map.values()]
    .map((v) => ({
      ...v,
      total: Math.round(v.total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total || a.nomeExibicao.localeCompare(b.nomeExibicao));
}

export function totaisGerais(compras: CompraFinalizada[]): {
  totalHistorico: number;
  totalMesAtual: number;
  numCompras: number;
  ticketMedio: number;
} {
  const totalHistorico = Math.round(
    compras.reduce((acc, c) => acc + c.total, 0) * 100,
  ) / 100;
  const hoje = chaveMesAtual();
  const totalMesAtual = Math.round(totalNoMes(compras, hoje) * 100) / 100;
  const numCompras = compras.length;
  const ticketMedio =
    numCompras > 0
      ? Math.round((totalHistorico / numCompras) * 100) / 100
      : 0;

  return {
    totalHistorico,
    totalMesAtual,
    numCompras,
    ticketMedio,
  };
}
