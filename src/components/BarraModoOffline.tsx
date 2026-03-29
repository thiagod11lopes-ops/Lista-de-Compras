import { motion } from "framer-motion";

/**
 * Aviso explícito de modo offline: a app continua utilizável; dados locais.
 * Renderizar só quando `navigator.onLine` for falso.
 */
export function BarraModoOffline() {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="fixed left-0 right-0 top-0 z-[28] border-b border-amber-300/90 bg-gradient-to-r from-amber-100/95 to-amber-50/95 px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] text-center shadow-md shadow-amber-900/10 backdrop-blur-sm"
    >
      <p className="mx-auto max-w-lg text-xs font-semibold leading-snug text-amber-950 sm:text-sm">
        Sem ligação à internet —{" "}
        <span className="whitespace-nowrap">modo offline ativo.</span> A lista
        e o balanço continuam neste aparelho; os dados não saem do telemóvel.
      </p>
    </motion.div>
  );
}
