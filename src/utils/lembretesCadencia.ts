import type { CompraFinalizada } from "../types/balanco";
import { normalizarParaComparacao } from "./duplicados";

export type LembreteCadencia = {
  nomeExibicao: string;
  nomeNormalizado: string;
  /** Mediana dos intervalos em dias entre compras (dias de calendário). */
  intervaloMedianoDias: number;
  diasDesdeUltimaCompra: number;
  /** Quanto passou do intervalo típico (útil para ordenar). */
  excessoDias: number;
};

function diaCalendarioKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diasEntreChaves(k1: string, k2: string): number {
  const [y1, mo1, d1] = k1.split("-").map(Number);
  const [y2, mo2, d2] = k2.split("-").map(Number);
  const a = new Date(y1, mo1 - 1, d1).getTime();
  const b = new Date(y2, mo2 - 1, d2).getTime();
  return Math.round((b - a) / 86_400_000);
}

function mediana(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export type OpcoesLembretesCadencia = {
  /** Máximo de lembretes devolvidos (por excesso). */
  maxItens?: number;
  /** Mínimo de dias distintos com compra para estimar cadência. */
  minDiasCompra?: number;
};

/**
 * Itens cujo intervalo típico entre compras já foi ultrapassado desde a última finalização
 * em que apareceram (com base em todo o histórico de finalizações).
 */
export function calcularLembretesCadencia(
  compras: CompraFinalizada[],
  agora: number,
  nomesJaNaListaNorm: Set<string>,
  opcoes?: OpcoesLembretesCadencia,
): LembreteCadencia[] {
  const maxItens = opcoes?.maxItens ?? 6;
  const minDiasCompra = opcoes?.minDiasCompra ?? 2;

  const ordenadas = [...compras].sort((a, b) => a.finalizadaEm - b.finalizadaEm);

  type Ac = { dias: Set<string>; display: string };
  const porNorm = new Map<string, Ac>();

  for (const c of ordenadas) {
    for (const it of c.itens) {
      const n = normalizarParaComparacao(it.nome);
      if (!n) continue;
      let e = porNorm.get(n);
      if (!e) {
        e = { dias: new Set<string>(), display: it.nome.trim() };
        porNorm.set(n, e);
      }
      e.dias.add(diaCalendarioKey(c.finalizadaEm));
      e.display = it.nome.trim();
    }
  }

  const hojeKey = diaCalendarioKey(agora);
  const result: LembreteCadencia[] = [];

  for (const [norm, { dias, display }] of porNorm) {
    if (nomesJaNaListaNorm.has(norm)) continue;

    const diasOrdenados = [...dias].sort();
    if (diasOrdenados.length < minDiasCompra) continue;

    const intervalos: number[] = [];
    for (let i = 1; i < diasOrdenados.length; i++) {
      intervalos.push(diasEntreChaves(diasOrdenados[i - 1]!, diasOrdenados[i]!));
    }

    const intervaloMediano = mediana(intervalos);
    if (intervaloMediano < 1) continue;

    const ultimaKey = diasOrdenados[diasOrdenados.length - 1]!;
    const diasDesde = diasEntreChaves(ultimaKey, hojeKey);
    if (diasDesde < intervaloMediano) continue;

    result.push({
      nomeExibicao: display,
      nomeNormalizado: norm,
      intervaloMedianoDias: Math.round(intervaloMediano * 10) / 10,
      diasDesdeUltimaCompra: diasDesde,
      excessoDias: diasDesde - intervaloMediano,
    });
  }

  result.sort((a, b) => b.excessoDias - a.excessoDias);
  return result.slice(0, maxItens);
}
