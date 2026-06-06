const KEY = "lista-compras:financasAccountEmail";

export function salvarFinancasAccountEmail(email: string): void {
  if (typeof window === "undefined") return;
  const v = email.trim();
  if (!v) return;
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* */
  }
}

export function carregarFinancasAccountEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY)?.trim() ?? "";
    return v.includes("@") ? v : null;
  } catch {
    return null;
  }
}
