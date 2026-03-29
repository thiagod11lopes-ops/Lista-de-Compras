const KEY = "lista-compras:syncPrefs";

export type SyncPrefs = {
  ativo: boolean;
  /** SHA-256 hex 64 chars — derivado de nome+senha, sem guardar a senha. */
  roomHash: string | null;
};

export function carregarSyncPrefs(): SyncPrefs {
  if (typeof window === "undefined") {
    return { ativo: false, roomHash: null };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ativo: false, roomHash: null };
    const o = JSON.parse(raw) as unknown;
    if (
      typeof o !== "object" ||
      o === null ||
      typeof (o as SyncPrefs).ativo !== "boolean"
    ) {
      return { ativo: false, roomHash: null };
    }
    const p = o as SyncPrefs;
    const hash =
      typeof p.roomHash === "string" && /^[a-f0-9]{64}$/.test(p.roomHash)
        ? p.roomHash
        : null;
    return { ativo: p.ativo && hash != null, roomHash: hash };
  } catch {
    return { ativo: false, roomHash: null };
  }
}

export function salvarSyncPrefs(p: SyncPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ativo: p.ativo, roomHash: p.roomHash }),
    );
  } catch {
    /* */
  }
}
