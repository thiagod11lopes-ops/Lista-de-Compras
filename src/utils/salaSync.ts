/** Identificador opaco da sala (nome + senha partilhada entre dispositivos). */
export async function hashSalaSync(nome: string, senha: string): Promise<string> {
  const t = `${nome.trim().toLowerCase()}|${senha}`;
  const enc = new TextEncoder().encode(t);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
