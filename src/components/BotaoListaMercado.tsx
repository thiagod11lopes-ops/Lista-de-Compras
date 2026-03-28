type Props = {
  ativo: boolean;
  disabled?: boolean;
  onIrMercado: () => void;
};

/** CTA principal fora do tablist — leva à tela de compras no mercado. */
export function BotaoListaMercado({
  ativo,
  disabled,
  onIrMercado,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onIrMercado}
      aria-pressed={ativo}
      className={[
        "group relative w-full overflow-hidden rounded-[1.35rem] border-2 px-4 py-3.5 text-left shadow-xl transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:py-4",
        ativo
          ? "border-white/90 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-blue-600/35 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent"
          : "border-white/50 bg-gradient-to-br from-blue-600/95 via-blue-500 to-indigo-700 text-white shadow-blue-900/25 hover:border-white/70 hover:shadow-2xl hover:brightness-[1.03]",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/20 text-2xl shadow-inner backdrop-blur-sm sm:h-14 sm:w-14"
          aria-hidden
        >
          🛒
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-black tracking-tight sm:text-lg">
            Lista do Mercado
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/88 sm:text-xs">
            Preços, quantidades e finalizar compra
          </p>
        </div>
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white transition group-hover:bg-white/25",
            ativo ? "bg-white/25" : "",
          ].join(" ")}
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </button>
  );
}
