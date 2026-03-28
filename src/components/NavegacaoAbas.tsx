export type AbaId = "mercado" | "faltando" | "adicionar" | "balanco";

/** Abas inferiores — “Lista do Mercado” é botão separado (BotaoListaMercado). */
const ABAS: { id: Exclude<AbaId, "mercado">; label: string }[] = [
  { id: "adicionar", label: "Adicionar Itens" },
  { id: "faltando", label: "Comprar Novamente" },
  { id: "balanco", label: "Balanço" },
];

type Props = {
  abaAtiva: AbaId;
  onMudarAba: (aba: AbaId) => void;
};

export function NavegacaoAbas({ abaAtiva, onMudarAba }: Props) {
  return (
    <nav
      className="rounded-2xl border border-white/60 bg-white/60 p-1 shadow-sm backdrop-blur-md"
      aria-label="Seções da lista"
    >
      <div className="grid grid-cols-3 gap-1" role="tablist">
        {ABAS.map((aba) => {
          const selecionada = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={selecionada}
              id={`tab-${aba.id}`}
              onClick={() => onMudarAba(aba.id)}
              className={[
                "flex min-h-[52px] items-center justify-center rounded-xl px-1 py-2 text-center text-[11px] font-semibold leading-snug transition sm:text-xs",
                selecionada
                  ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-700 active:bg-white/90 sm:hover:bg-white/80",
              ].join(" ")}
            >
              {aba.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
