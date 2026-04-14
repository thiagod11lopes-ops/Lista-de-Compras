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
  /** Lista vazia: realça a aba Adicionar Itens (pulsar amarelo). */
  realcarAbaAdicionar?: boolean;
  /** Após fechar o modal de parabéns pela primeira lista: Iniciar compras laranja + balão. */
  realcarBotaoIniciarCompras?: boolean;
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
  realcarAbaAdicionar = false,
  realcarBotaoIniciarCompras = false,
}: Props) {
  const mercadoAtivo = abaAtiva === "mercado";
  const realceIniciar = realcarBotaoIniciarCompras && !mercadoAtivo;

  return (
    <nav
      className="relative z-40 isolate rounded-2xl border border-white/60 bg-white/60 p-1 shadow-sm backdrop-blur-md"
      aria-label="Seções da lista"
    >
      <div className="relative grid grid-cols-4 gap-1" role="tablist">
        {realcarAbaAdicionar ? (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0.96, y: -1 }}
            animate={{ opacity: [1, 0.9, 1], y: [0, -2, 0] }}
            transition={{
              duration: 1.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -top-14 left-[48%] z-[50] -translate-x-1/2 rounded-2xl border border-amber-300/95 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-900 shadow-md shadow-amber-200/60"
          >
            Adicione Itens a sua lista
            <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-amber-300/95 bg-white" />
            <span className="absolute -bottom-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-amber-200" />
            <span className="absolute -bottom-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-amber-200" />
          </motion.div>
        ) : null}
        {realceIniciar ? (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0.96, y: -1 }}
            animate={{ opacity: [1, 0.9, 1], y: [0, -2, 0] }}
            transition={{
              duration: 1.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -top-14 left-[22%] z-[50] max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-amber-300/95 bg-white px-3 py-1.5 text-center text-[11px] font-semibold leading-snug text-amber-900 shadow-md shadow-amber-200/60"
          >
            Clique aqui para iniciar as compras
            <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-amber-300/95 bg-white" />
            <span className="absolute -bottom-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-amber-200" />
            <span className="absolute -bottom-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-amber-200" />
          </motion.div>
        ) : null}
        {realceIniciar ? (
          <motion.button
            type="button"
            role="tab"
            id="tab-mercado"
            aria-selected={mercadoAtivo}
            disabled={disabled}
            onClick={onIrListaMercado}
            className="relative z-[1] flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 px-0.5 py-2 text-center text-white shadow-md shadow-amber-500/40 sm:min-h-[56px]"
            animate={{
              scale: [1, 1.04, 1],
              opacity: [1, 0.86, 1],
              boxShadow: [
                "0 0 0 0 rgba(251, 146, 60, 0.72)",
                "0 0 0 12px rgba(251, 146, 60, 0)",
                "0 0 0 0 rgba(251, 146, 60, 0.72)",
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-white shadow-inner sm:h-8 sm:w-8"
              animate={{ scale: [1, 1.06, 1], opacity: [1, 0.92, 1] }}
              transition={{
                duration: 1.4,
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
            <span className="sr-only"> — destaque: toque para iniciar</span>
          </motion.button>
        ) : (
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
        )}

        {ABAS.map((aba) => {
          const selecionada = abaAtiva === aba.id;
          const realce =
            aba.id === "adicionar" && realcarAbaAdicionar;
          const classBase = [
            "flex min-h-[52px] items-center justify-center rounded-xl px-1 py-2 text-center text-[10px] font-semibold leading-snug transition sm:min-h-[56px] sm:text-xs",
            realce
              ? "relative z-[1] border border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/40"
              : selecionada
                ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                : "text-slate-700 active:bg-white/90 sm:hover:bg-white/80",
          ].join(" ");

          if (realce) {
            return (
              <motion.button
                key={aba.id}
                type="button"
                role="tab"
                aria-selected={selecionada}
                id={`tab-${aba.id}`}
                disabled={disabled}
                onClick={() => onMudarAba(aba.id)}
                className={classBase}
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [1, 0.86, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(251, 146, 60, 0.72)",
                    "0 0 0 12px rgba(251, 146, 60, 0)",
                    "0 0 0 0 rgba(251, 146, 60, 0.72)",
                  ],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {aba.label}
                <span className="sr-only"> — destaque do tutorial</span>
              </motion.button>
            );
          }

          return (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={selecionada}
              id={`tab-${aba.id}`}
              disabled={disabled}
              onClick={() => onMudarAba(aba.id)}
              className={classBase}
            >
              {aba.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
