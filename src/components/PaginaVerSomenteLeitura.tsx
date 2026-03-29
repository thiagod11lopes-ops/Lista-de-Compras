import { useEffect, useState } from "react";
import { firebaseConfigCompleto } from "../config/firebaseEnv";
import { obterEstadoSomenteLeitura } from "../services/shareReadonlyFirestore";
import type { EstadoLista } from "../services/storage";
import { blocosPorCategoria } from "../utils/agruparItens";
import type { ViagemLista } from "../types/viagem";

type Props = {
  token: string;
  onSair: () => void;
};

function SecaoViagemLeitura({ viagem }: { viagem: ViagemLista }) {
  const blocos = blocosPorCategoria(
    viagem.itens,
    viagem.categorias,
    viagem.ordemCorredoresCategoriaIds,
  );

  return (
    <section
      className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm"
      aria-labelledby={`titulo-viagem-${viagem.id}`}
    >
      <h2
        id={`titulo-viagem-${viagem.id}`}
        className="text-lg font-bold text-blue-950"
      >
        {viagem.nome}
      </h2>
      <p className="mt-0.5 text-xs text-slate-600">
        {viagem.itens.length} itens · {viagem.comprasFinalizadas.length}{" "}
        finalizações no histórico
      </p>
      <div className="mt-4 space-y-5">
        {blocos.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhum item nesta lista.</p>
        ) : (
          blocos.map((bloco) => (
            <div key={bloco.categoriaId ?? "sc"}>
              {bloco.titulo ? (
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-900/80">
                  {bloco.titulo}
                </h3>
              ) : null}
              <ul className="space-y-1.5">
                {bloco.itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-baseline gap-2 text-sm text-slate-800"
                  >
                    <span
                      className={
                        item.comprado
                          ? "text-slate-500 line-through"
                          : "font-medium"
                      }
                    >
                      {item.nome}
                    </span>
                    {item.unidadeLista === "kg" ? (
                      <span className="text-xs text-slate-500">(kg)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function PaginaVerSomenteLeitura({ token, onSair }: Props) {
  const [estado, setEstado] = useState<EstadoLista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const firebaseOk = firebaseConfigCompleto();

  useEffect(() => {
    if (!firebaseOk) {
      setCarregando(false);
      setErro(
        "Firebase não está configurado nesta instalação. Quem partilhou o link precisa de um build com as variáveis VITE_FIREBASE_*.",
      );
      return;
    }
    let vivo = true;
    void (async () => {
      try {
        const e = await obterEstadoSomenteLeitura(token);
        if (!vivo) return;
        if (!e) {
          setErro("Link inválido ou expirado — não foi encontrado um snapshot.");
          setEstado(null);
        } else {
          setEstado(e);
        }
      } catch (e) {
        if (!vivo) return;
        setErro(e instanceof Error ? e.message : String(e));
      } finally {
        if (vivo) setCarregando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [token, firebaseOk]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-100 to-blue-50/90 px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="mx-auto mb-6 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Consulta
          </p>
          <h1 className="text-xl font-bold text-blue-950">
            Lista de compras (só leitura)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Não é possível alterar nem adicionar itens nesta página.
          </p>
        </div>
        <button
          type="button"
          onClick={onSair}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Abrir app
        </button>
      </header>

      <div className="mx-auto max-w-lg space-y-4">
        {carregando ? (
          <p className="text-center text-sm text-slate-600">A carregar…</p>
        ) : erro ? (
          <p
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {erro}
          </p>
        ) : estado && estado.viagens.length > 0 ? (
          estado.viagens.map((v) => (
            <SecaoViagemLeitura key={v.id} viagem={v} />
          ))
        ) : (
          <p className="text-center text-sm text-slate-600">
            Nada para mostrar.
          </p>
        )}
      </div>
    </div>
  );
}
