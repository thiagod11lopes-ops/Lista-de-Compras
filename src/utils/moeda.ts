/** Formata valor em reais (pt-BR), ex.: R$ 10,00 */
export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Interpreta texto digitado (com ou sem R$, vírgula ou ponto decimal).
 * Retorna null se vazio ou inválido.
 */
export function parsearEntradaMoeda(texto: string): number | null {
  let t = texto.trim();
  if (t === "") return null;
  t = t.replace(/R\$\s?/gi, "").trim();
  if (t === "") return null;

  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");

  if (lastComma >= 0 && lastComma > lastDot) {
    t = t.replace(/\./g, "").replace(",", ".");
  } else if (lastDot >= 0 && lastDot > lastComma) {
    t = t.replace(/,/g, "");
  } else {
    t = t.replace(",", ".");
  }

  const n = parseFloat(t);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}
