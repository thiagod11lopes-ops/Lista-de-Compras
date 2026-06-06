import { salvarSyncPrefs } from "./syncPrefs";

const ROOM_HASH_RE = /^[a-f0-9]{64}$/;

/** Ativa sincronização quando o app Finanças abre esta lista com `?roomHash=…`. */
export function aplicarSyncFinancasDaUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("roomHash")?.trim().toLowerCase() ?? "";
  if (!ROOM_HASH_RE.test(raw)) return;

  salvarSyncPrefs({ ativo: true, roomHash: raw });
  params.delete("roomHash");
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}
