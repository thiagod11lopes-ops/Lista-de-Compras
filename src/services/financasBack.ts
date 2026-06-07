const FROM_FINANCAS_PWA_KEY = "lista-compras:fromFinancasPwa";

export const FINANCAS_APP_URL = "https://thiagod11lopes-ops.github.io/Financasfina/";

export function isOpenedFromFinancasPwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(FROM_FINANCAS_PWA_KEY) === "1";
  } catch {
    return false;
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return window.matchMedia("(display-mode: standalone)").matches;
}
