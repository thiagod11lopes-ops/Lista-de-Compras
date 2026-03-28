/**
 * Consulta pública Open Food Facts (sem chave).
 * https://openfoodfacts.github.io/openfoodfacts-server/api/
 */
export async function buscarNomePorCodigoBarras(
  codigoBruto: string,
): Promise<string | null> {
  const clean = codigoBruto.replace(/\D/g, "");
  if (clean.length < 8 || clean.length > 14) return null;

  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${clean}.json`,
      { signal: controller.signal },
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      (data as { status?: number }).status === 1
    ) {
      const product = (data as { product?: { product_name?: string } })
        .product;
      const nome = product?.product_name?.trim();
      if (nome) return nome;
    }
  } catch {
    /* rede / abort */
  } finally {
    clearTimeout(t);
  }
  return null;
}
