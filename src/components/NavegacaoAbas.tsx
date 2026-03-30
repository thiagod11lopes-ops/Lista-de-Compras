import { motion } from "framer-motion";

export type AbaId = "mercado" | "faltando" | "adicionar" | "balanco";

const ABAS: { id: Exclude<AbaId, "mercado">; label: string }[] = [
  { id: "adicionar", label: "Adicionar Itens" },
  { id: "faltando", label: "Comprar Novamente" },
  { id: "balanco", label: "Balanço" },
];

type Props = {
  abaAtiva: AbaId;
  onMudarAba: (aba: AbaId) => void;
  /** Abre Iniciar compras (escolha do tipo de lista). */
  onIrListaMercado: () => void;
  disabled?: boolean;
};

function IconePlay({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function NavegacaoAbas({
  abaAtiva,
  onMudarAba,
  onIrListaMercado,
  disabled = false,
}: Props) {
  const mercadoAtivo = abaAtiva === "mercado";

  return (
    <nav
      className="rounded-2xl border border-white/60 bg-white/60 p-1 shadow-sm backdrop-blur-md"
      aria-label="Seções da lista"
    >
      <div className="grid grid-cols-4 gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          id="tab-mercado"
          aria-selected={mercadoAtivo}
          disabled={disabled}
          onClick={onIrListaMercado}
          className={[
            "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-center transition sm:min-h-[56px]",
            mercadoAtivo
              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
              : "text-slate-700 active:bg-white/90 sm:hover:bg-white/80",
          ].join(" ")}
        >
          <motion.span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8",
              mercadoAtivo
                ? "bg-white/25 text-white shadow-inner"
                : "bg-blue-500/15 text-blue-600",
            ].join(" ")}
            animate={
              mercadoAtivo
                ? { scale: [1, 1.06, 1], opacity: [1, 0.92, 1] }
                : { scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }
            }
            transition={{
              duration: mercadoAtivo ? 2.4 : 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <IconePlay className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </motion.span>
          <span className="text-[9px] font-semibold leading-tight sm:text-[10px]">
            <span className="block sm:inline">Iniciar </span>
            <span className="block sm:inline">Compras</span>
          </span>
        </button>

        {ABAS.map((aba) => {
          const selecionada = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={selecionada}
              id={`tab-${aba.id}`}
              disabled={disabled}
              onClick={() => onMudarAba(aba.id)}
              className={[
                "flex min-h-[52px] items-center justify-center rounded-xl px-1 py-2 text-center text-[10px] font-semibold leading-snug transition sm:min-h-[56px] sm:text-xs",
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
