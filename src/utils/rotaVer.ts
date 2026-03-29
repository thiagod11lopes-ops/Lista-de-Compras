/** Fragmento `#/ver/<64 hex>` — link só leitura partilhado. */
export function extrairTokenVerDaHash(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw.toLowerCase().startsWith("ver/")) return null;
  const rest = raw.slice(4).split(/[?#]/)[0] ?? "";
  const token = rest.split("/")[0]?.trim() ?? "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  return token.toLowerCase();
}
