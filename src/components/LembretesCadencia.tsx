import { motion } from "framer-motion";
import type { LembreteCadencia } from "../utils/lembretesCadencia";

type Props = {
  lembretes: LembreteCadencia[];
  disabled?: boolean;
  onEscolher: (nome: string) => void;
};

export function LembretesCadencia({
  lembretes,
  disabled = false,
  onEscolher,
}: Props) {
  if (lembretes.length === 0) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200/95 bg-gradient-to-br from-amber-50/95 to-orange-50/60 p-4 shadow-sm shadow-amber-900/5"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg"
          aria-hidden
        >
          ⏱
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base font-bold text-amber-950">
            Lembretes por cadência
          </h3>
          <p className="text-sm leading-snug text-amber-950/80">
            Com base nas compras finalizadas, o intervalo típico entre uma compra e
            outra destes produtos já foi ultrapassado. Toque para adicionar à lista.
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-2" aria-label="Itens sugeridos">
        {lembretes.map((l) => (
          <li key={l.nomeNormalizado}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onEscolher(l.nomeExibicao)}
              className="flex w-full flex-col gap-0.5 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2.5 text-left transition enabled:active:scale-[0.99] enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-semibold text-slate-900">
                {l.nomeExibicao}
              </span>
              <span className="text-sm text-slate-600">
                ~a cada {Math.round(l.intervaloMedianoDias)} dias · há{" "}
                {l.diasDesdeUltimaCompra} dias desde a última vez
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
