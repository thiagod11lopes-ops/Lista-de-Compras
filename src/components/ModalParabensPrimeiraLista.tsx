import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useMemo } from "react";

type Props = {
  aberto: boolean;
  onFechar: () => void;
};

const CORES_CONFETE = [
  "#f97316",
  "#eab308",
  "#ec4899",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ef4444",
];

const CORES_FOGO = [
  "rgba(251, 146, 60, 0.9)",
  "rgba(234, 179, 8, 0.85)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(59, 130, 246, 0.75)",
];

export function ModalParabensPrimeiraLista({ aberto, onFechar }: Props) {
  const tituloId = useId();

  const confetes = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.4,
        duration: 2.2 + Math.random() * 1.8,
        rot: (Math.random() - 0.5) * 1080,
        color: CORES_CONFETE[i % CORES_CONFETE.length],
        size: 6 + Math.random() * 8,
        xDrift: (Math.random() - 0.5) * 120,
      })),
    [],
  );

  const fogos = useMemo(
    () =>
      [18, 38, 58, 78].map((leftPct, i) => ({
        id: i,
        left: `${leftPct}%`,
        delay: i * 0.35,
      })),
    [],
  );

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={onFechar}
          />
          {/* Confetes */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            {confetes.map((c) => (
              <motion.div
                key={c.id}
                className="absolute rounded-sm shadow-sm"
                style={{
                  left: c.left,
                  top: "-4%",
                  width: c.size,
                  height: c.size * 0.55,
                  backgroundColor: c.color,
                }}
                initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: "110vh",
                  x: c.xDrift,
                  rotate: c.rot,
                  opacity: [1, 1, 0.85, 0],
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
              />
            ))}
          </div>

          {/* Fogos de artifício */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            {fogos.map((f, idx) => (
              <div
                key={f.id}
                className="absolute top-[10%] h-28 w-28 -translate-x-1/2"
                style={{ left: f.left }}
              >
                <div className="relative h-full w-full">
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: CORES_FOGO[idx % CORES_FOGO.length],
                      boxShadow: `0 0 12px 4px ${CORES_FOGO[idx % CORES_FOGO.length]}`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.65,
                      delay: f.delay,
                      repeat: Infinity,
                      repeatDelay: 2.1,
                      ease: "easeOut",
                    }}
                  />
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((raio) => {
                    const ang = (raio * 2 * Math.PI) / 8;
                    const dist = 52;
                    return (
                      <motion.div
                        key={raio}
                        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: CORES_FOGO[(idx + raio) % CORES_FOGO.length],
                          boxShadow: `0 0 10px 3px ${CORES_FOGO[(idx + raio) % CORES_FOGO.length]}`,
                        }}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos(ang) * dist,
                          y: Math.sin(ang) * dist,
                          scale: [0, 1, 0.3],
                          opacity: [1, 1, 0],
                        }}
                        transition={{
                          duration: 0.85,
                          delay: f.delay + raio * 0.03,
                          repeat: Infinity,
                          repeatDelay: 1.95,
                          ease: "easeOut",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-6 py-8 text-center shadow-2xl shadow-amber-900/20"
          >
            <div className="mb-3 text-4xl" aria-hidden>
              🎉
            </div>
            <h2
              id={tituloId}
              className="text-lg font-bold leading-snug text-blue-950 sm:text-xl"
            >
              Parabéns, você aprendeu a criar uma lista de compras
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Adicione mais itens e clique em Iniciar Compras
            </p>
            <button
              type="button"
              onClick={onFechar}
              className="mt-6 min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
