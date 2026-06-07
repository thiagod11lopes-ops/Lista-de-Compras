import { FINANCAS_APP_URL, isOpenedFromFinancasPwa, isStandalonePwa } from "../services/financasBack";

/** Voltar ao Finanças quando a lista foi aberta pelo carrinho no PWA. */
export function BarraVoltarFinancas() {
  if (!isOpenedFromFinancasPwa()) return null;

  const emPwa = isStandalonePwa();

  return (
    <div
      className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex max-w-[min(100%,18rem)] flex-col items-end gap-1 sm:right-4"
      role="complementary"
      aria-label="Voltar ao Finanças"
    >
      <a
        href={FINANCAS_APP_URL}
        className="inline-flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow-md backdrop-blur-md transition hover:bg-white active:scale-[0.98]"
      >
        <span aria-hidden>←</span>
        Finanças
      </a>
      {emPwa ? (
        <p className="rounded-xl bg-slate-900/75 px-2.5 py-1.5 text-right text-[0.68rem] leading-snug text-white/90 shadow-md backdrop-blur-sm">
          Modo app ativo. Para um ícone só de compras: no Safari, «Partilhar» → «Adicionar ao ecrã
          inicial» nesta página.
        </p>
      ) : null}
    </div>
  );
}
