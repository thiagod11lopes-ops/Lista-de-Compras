import { useEffect, useRef, useState } from "react";
import { firebaseConfigCompleto } from "../config/firebaseEnv";
import { garantirEstadoValido, type EstadoLista } from "../services/storage";
import {
  enviarEstado,
  garantirDocumentoInicial,
  subscreverSala,
} from "../services/syncFirestore";

export type SyncStatusUi =
  | "desligado"
  | "a_ligar"
  | "sincronizando"
  | "erro";

type Params = {
  hidratar: boolean;
  estadoLista: EstadoLista;
  substituirEstadoCompleto: (estado: EstadoLista) => void;
  syncAtivo: boolean;
  roomHash: string | null;
};

/**
 * Sincronização em tempo real do estado completo via Firestore.
 * Eco do próprio envio é ignorado comparando o payload JSON.
 */
export function useFirestoreListaSync({
  hidratar,
  estadoLista,
  substituirEstadoCompleto,
  syncAtivo,
  roomHash,
}: Params) {
  const [status, setStatus] = useState<SyncStatusUi>("desligado");
  const [erro, setErro] = useState<string | null>(null);
  const [escutaPronta, setEscutaPronta] = useState(false);

  const lastPushPayloadRef = useRef<string | null>(null);
  const aplicandoRemotoRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const estadoRef = useRef(estadoLista);
  estadoRef.current = estadoLista;

  const firebaseOk = firebaseConfigCompleto();

  useEffect(() => {
    if (!syncAtivo || !roomHash || !firebaseOk) {
      unsubRef.current?.();
      unsubRef.current = null;
      setEscutaPronta(false);
      setStatus("desligado");
      if (!syncAtivo || !roomHash) setErro(null);
      return;
    }

    if (hidratar) return;

    let vivo = true;
    setEscutaPronta(false);
    setStatus("a_ligar");
    setErro(null);

    const estadoInicial = estadoRef.current;

    void (async () => {
      try {
        await garantirDocumentoInicial(roomHash, estadoInicial);
        if (!vivo) return;

        const inicialJson = JSON.stringify(garantirEstadoValido(estadoInicial));
        lastPushPayloadRef.current = inicialJson;

        unsubRef.current?.();
        unsubRef.current = subscreverSala(
          roomHash,
          (dados) => {
            if (aplicandoRemotoRef.current) return;
            if (dados.payload === lastPushPayloadRef.current) return;
            try {
              const parsed: unknown = JSON.parse(dados.payload);
              aplicandoRemotoRef.current = true;
              substituirEstadoCompleto(
                garantirEstadoValido(parsed as EstadoLista),
              );
              lastPushPayloadRef.current = dados.payload;
              queueMicrotask(() => {
                aplicandoRemotoRef.current = false;
              });
            } catch {
              setErro("Não foi possível ler os dados da nuvem.");
              setStatus("erro");
            }
          },
          (e) => {
            setErro(e.message);
            setStatus("erro");
          },
        );
        if (!vivo) return;
        setEscutaPronta(true);
        setStatus("sincronizando");
      } catch (e) {
        if (!vivo) return;
        setErro(e instanceof Error ? e.message : String(e));
        setStatus("erro");
        setEscutaPronta(false);
      }
    })();

    return () => {
      vivo = false;
      unsubRef.current?.();
      unsubRef.current = null;
      setEscutaPronta(false);
    };
    // estadoLista de propósito omitido: evita re-subscrever a cada edição local
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só re-ligar ao mudar sala/rede
  }, [hidratar, syncAtivo, roomHash, firebaseOk, substituirEstadoCompleto]);

  const estadoStr = JSON.stringify(estadoLista);

  useEffect(() => {
    if (!syncAtivo || !roomHash || !firebaseOk || hidratar || !escutaPronta) {
      return;
    }
    if (aplicandoRemotoRef.current) return;
    if (estadoStr === lastPushPayloadRef.current) return;

    const t = window.setTimeout(() => {
      if (aplicandoRemotoRef.current) return;
      void enviarEstado(roomHash, estadoLista)
        .then(() => {
          lastPushPayloadRef.current = estadoStr;
          setErro(null);
          setStatus("sincronizando");
        })
        .catch((e: unknown) => {
          setErro(e instanceof Error ? e.message : String(e));
          setStatus("erro");
        });
    }, 700);

    return () => window.clearTimeout(t);
  }, [
    estadoStr,
    estadoLista,
    syncAtivo,
    roomHash,
    firebaseOk,
    hidratar,
    escutaPronta,
  ]);

  return {
    syncStatus: status,
    syncErro: erro,
    firebaseConfigurado: firebaseOk,
  };
}
