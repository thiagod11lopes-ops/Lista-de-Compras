import { emailDisplayLabel } from "../utils/emailDisplay";

type Props = {
  email: string | null;
  visivel: boolean;
};

/** Indicador no topo (como no Finanças): nuvem ativa + e-mail da conta Google. */
export function BadgeNuvemFinancas({ email, visivel }: Props) {
  if (!visivel || !email) return null;

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-[max(0.5rem,env(safe-area-inset-top))] z-[29] flex max-w-[min(240px,calc(100vw-1.5rem))] -translate-x-1/2 flex-col items-center gap-0.5 rounded-full border border-emerald-300/70 bg-white/90 px-3 py-1.5 shadow-md shadow-emerald-900/10 backdrop-blur-md"
      title={`Sincronizado com a conta ${email}`}
      aria-label={`Nuvem ativa. Conta ${email}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.55)]"
          aria-hidden
        />
        <span className="text-[10px] font-bold tracking-wide text-emerald-800">
          Nuvem ativa
        </span>
      </div>
      <span className="max-w-full truncate text-[9px] font-medium text-slate-600">
        {emailDisplayLabel(email)}
      </span>
    </div>
  );
}
