import { salvarFinancasAccountEmail } from "./financasAccount";
import { salvarSyncPrefs } from "./syncPrefs";

const ROOM_HASH_RE = /^[a-f0-9]{64}$/;

/** Ativa sincronização quando o app Finanças abre esta lista com `?roomHash=…`. */
export function aplicarSyncFinancasDaUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("roomHash")?.trim().toLowerCase() ?? "";
  const email = params.get("accountEmail")?.trim() ?? "";
  let changed = false;

  if (ROOM_HASH_RE.test(raw)) {
    salvarSyncPrefs({ ativo: true, roomHash: raw });
    changed = true;
  }
  if (email.includes("@")) {
    salvarFinancasAccountEmail(email);
    changed = true;
  }
  if (!changed) return;

  params.delete("roomHash");
  params.delete("accountEmail");
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", next);
}
