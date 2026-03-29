import { motion } from "framer-motion";

type Props = {
  /** Oculta quando estamos em offline (a `BarraModoOffline` já explica o contexto). */
  visivel: boolean;
};

/**
 * Lembra sempre que os dados são locais e que a lista funciona sem internet.
 */
export function FaixaDadosLocais({ visivel }: Props) {
  if (!visivel) return null;

  return (
    <motion.div
      layout
      role="note"
      initial={false}
      className="rounded-2xl border border-blue-200/80 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur-sm"
    >
      <p className="flex items-start gap-2 text-left text-xs leading-relaxed text-slate-700 sm:text-[13px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <span>
          <span className="font-semibold text-blue-950">Dados neste aparelho.</span>{" "}
          A lista e o balanço funcionam sem internet; nada é enviado para um
          servidor. Só a leitura de código de barras precisa de rede para
          procurar o nome do produto.
        </span>
      </p>
    </motion.div>
  );
}
