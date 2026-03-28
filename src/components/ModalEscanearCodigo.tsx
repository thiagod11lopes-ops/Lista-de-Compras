import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { buscarNomePorCodigoBarras } from "../services/openFoodFacts";

const ELEMENT_ID = "escanear-codigo-barras-view";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  /** Nome sugerido para o item (já resolvido com Open Food Facts quando possível). */
  onNomeDetectado: (nome: string) => void;
};

export function ModalEscanearCodigo({
  aberto,
  onFechar,
  onNomeDetectado,
}: Props) {
  const tituloId = useId();
  const [erroCamara, setErroCamara] = useState<string | null>(null);
  const [aProcessar, setAProcessar] = useState(false);
  const processandoRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onFecharRef = useRef(onFechar);
  const onNomeDetectadoRef = useRef(onNomeDetectado);
  onFecharRef.current = onFechar;
  onNomeDetectadoRef.current = onNomeDetectado;

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFecharRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) {
      setErroCamara(null);
      setAProcessar(false);
      processandoRef.current = false;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s?.isScanning) {
        void s.stop().then(() => {
          try {
            s.clear();
          } catch {
            /* */
          }
        });
      }
      return;
    }

    setErroCamara(null);
    processandoRef.current = false;

    const html5 = new Html5Qrcode(ELEMENT_ID, {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
    });
    scannerRef.current = html5;

    let vivo = true;

    void html5
      .start(
        { facingMode: "environment" },
        {
          fps: 8,
          qrbox: (w, h) => {
            const width = Math.min(280, Math.floor(w * 0.92));
            const height = Math.min(200, Math.floor(h * 0.35));
            return { width, height: Math.max(80, height) };
          },
          aspectRatio: 1.6,
        },
        async (decodedText) => {
          if (!vivo || processandoRef.current) return;
          processandoRef.current = true;
          setAProcessar(true);
          try {
            await html5.stop();
            try {
              html5.clear();
            } catch {
              /* */
            }
            scannerRef.current = null;
            const nomeApi = await buscarNomePorCodigoBarras(decodedText);
            const clean = decodedText.replace(/\D/g, "");
            const nome =
              nomeApi?.trim() ||
              (clean ? `Produto ${clean}` : decodedText.trim());
            onNomeDetectadoRef.current(nome);
            onFecharRef.current();
          } catch {
            setErroCamara("Não foi possível ler o código. Tente de novo.");
            processandoRef.current = false;
            setAProcessar(false);
          }
        },
        () => {},
      )
      .catch(() => {
        if (!vivo) return;
        setErroCamara(
          "Não foi possível usar a câmara. Verifique as permissões do browser ou use HTTPS / localhost.",
        );
      });

    return () => {
      vivo = false;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s?.isScanning) {
        void s.stop().then(() => {
          try {
            s.clear();
          } catch {
            /* */
          }
        });
      }
    };
  }, [aberto]);

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-[58] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={onFechar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2
                    id={tituloId}
                    className="text-lg font-bold text-blue-950"
                  >
                    Escanear código
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Aponte para o código de barras do produto. O nome é
                    pesquisado na base{" "}
                    <span className="font-medium">Open Food Facts</span> quando
                    existir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onFechar}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="Fechar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative bg-slate-900 px-2 py-4">
              <div
                id={ELEMENT_ID}
                className="mx-auto overflow-hidden rounded-2xl [&_video]:max-h-[min(50vh,320px)] [&_video]:w-full"
              />
              {aProcessar ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/70">
                  <p className="rounded-xl bg-white/95 px-4 py-2 text-sm font-medium text-slate-800 shadow-lg">
                    A obter nome do produto…
                  </p>
                </div>
              ) : null}
            </div>

            {erroCamara ? (
              <p className="px-5 py-3 text-sm text-red-700" role="alert">
                {erroCamara}
              </p>
            ) : (
              <p className="px-5 py-3 text-xs text-slate-500">
                Dados de produto: Open Food Facts — contribuições da comunidade.
              </p>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
