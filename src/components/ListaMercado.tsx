import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { Categoria, ItemCompra } from "../types/item";
import {
  podeMarcarComoComprado,
  precoPreenchido,
  quantidadePreenchida,
  subtotalLinhaMercado,
} from "../utils/itemMercado";
import { formatarMoedaBRL } from "../utils/moeda";
import { blocosPorCategoria } from "../utils/agruparItens";
import {
  linhasTotaisComprados,
  linhasTotaisCompradosPorCategoria,
  somaTotaisLinhas,
} from "../utils/itemMercado";
import { Item } from "./Item";
import { ModalAvisoPendentesFinalizar } from "./ModalAvisoPendentesFinalizar";
import { ModalAvisoValidacaoMercado } from "./ModalAvisoValidacaoMercado";
import { ModalFinalizarCompras } from "./ModalFinalizarCompras";

export type ModoListaMercado = "simples" | "completa";

type Props = {
  itens: ItemCompra[];
  categorias: Categoria[];
  /** Ordem dos grupos (corredores) na loja habitual. */
  ordemCorredoresCategoriaIds: string[];
  modoLista: ModoListaMercado;
  /** Quando não há linhas no mercado mas ainda existem itens no app (só fora desta lista). */
  mercadoVazioMasExistemItensNoApp?: boolean;
  onAbrirOrdemCorredores: () => void;
  onToggle: (id: string) => void;
  onPrecoChange: (id: string, preco: number | null) => void;
  onQuantidadeChange: (id: string, valor: number | null) => void;
  onRetirarDaListaMercado: (id: string) => void;
  onFinalizarCompras: () => void;
};

export function ListaMercado({
  itens,
  categorias,
  ordemCorredoresCategoriaIds,
  modoLista,
  mercadoVazioMasExistemItensNoApp = false,
  onAbrirOrdemCorredores,
  onToggle,
  onPrecoChange,
  onQuantidadeChange,
  onRetirarDaListaMercado,
  onFinalizarCompras,
}: Props) {
  const listaSimples = modoLista === "simples";
  const [modalAvisoValidacao, setModalAvisoValidacao] = useState<{
    nomeItem: string;
    msg: string;
  } | null>(null);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [modalAvisoPendentesFinalizar, setModalAvisoPendentesFinalizar] =
    useState(false);

  const blocos = blocosPorCategoria(
    itens,
    categorias,
    ordemCorredoresCategoriaIds,
  );
  const temComprados = itens.some((i) => i.comprado);

  const totalPrecos = useMemo(() => {
    return itens.reduce((acc, i) => {
      const s = subtotalLinhaMercado(i);
      if (s != null) return acc + s;
      return acc;
    }, 0);
  }, [itens]);

  const resumoFinalizar = useMemo(() => {
    const linhasPorItem = linhasTotaisComprados(itens);
    return {
      linhas: linhasTotaisCompradosPorCategoria(
        itens,
        categorias,
        ordemCorredoresCategoriaIds,
      ),
      total: somaTotaisLinhas(linhasPorItem),
    };
  }, [itens, categorias, ordemCorredoresCategoriaIds]);

  const blocosResumoSimples = useMemo(() => {
    const comprados = itens.filter((i) => i.comprado);
    const blocosC = blocosPorCategoria(
      comprados,
      categorias,
      ordemCorredoresCategoriaIds,
    );
    return blocosC.map((b) => ({
      titulo: b.titulo.trim() || "Sem categoria",
      nomes: b.itens.map((i) => i.nome),
    }));
  }, [itens, categorias, ordemCorredoresCategoriaIds]);

  const contagemMercado = useMemo(() => {
    const comprados = itens.filter((i) => i.comprado).length;
    const faltando = itens.length - comprados;
    return { comprados, faltando };
  }, [itens]);

  const aoAlternarMercado = useCallback(
    (item: ItemCompra) => {
      if (item.comprado) {
        setModalAvisoValidacao(null);
        onToggle(item.id);
        return;
      }
      if (!listaSimples && !podeMarcarComoComprado(item)) {
        const faltaPreco = !precoPreenchido(item);
        const faltaQtd = !quantidadePreenchida(item);
        let msg: string;
        if (faltaPreco && faltaQtd) {
          msg =
            "Preencha o preço unitário e a quantidade antes de marcar como comprado.";
        } else if (faltaPreco) {
          msg = "Preencha o preço unitário antes de marcar como comprado.";
        } else {
          msg = "Preencha a quantidade antes de marcar como comprado.";
        }
        setModalAvisoValidacao({ nomeItem: item.nome, msg });
        return;
      }
      setModalAvisoValidacao(null);
      onToggle(item.id);
    },
    [onToggle, listaSimples],
  );

  return (
    <section className="space-y-3" aria-labelledby="titulo-mercado">
      <ModalAvisoValidacaoMercado
        aberto={!listaSimples && modalAvisoValidacao != null}
        nomeItem={modalAvisoValidacao?.nomeItem ?? ""}
        mensagem={modalAvisoValidacao?.msg ?? ""}
        onFechar={() => setModalAvisoValidacao(null)}
      />
      <ModalAvisoPendentesFinalizar
        aberto={modalAvisoPendentesFinalizar}
        quantidadePendentes={contagemMercado.faltando}
        onVoltar={() => setModalAvisoPendentesFinalizar(false)}
        onContinuar={() => {
          setModalAvisoPendentesFinalizar(false);
          setModalFinalizarAberto(true);
        }}
      />
      <ModalFinalizarCompras
        aberto={modalFinalizarAberto}
        onFechar={() => setModalFinalizarAberto(false)}
        onConfirmar={() => {
          onFinalizarCompras();
          setModalFinalizarAberto(false);
        }}
        linhas={resumoFinalizar.linhas}
        total={resumoFinalizar.total}
        listaSimples={listaSimples}
        blocosResumoSimples={blocosResumoSimples}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-2xl leading-none shadow-md shadow-blue-900/15 backdrop-blur-sm"
            aria-hidden
          >
            🛒
          </span>
          <h2
            id="titulo-mercado"
            className="text-lg font-bold tracking-tight text-blue-950 [text-shadow:0_1px_0_rgb(255_255_255/0.85),0_2px_6px_rgb(15_23_42/0.35),0_4px_12px_rgb(15_23_42/0.12)]"
          >
            Lista do Mercado
          </h2>
        </div>
        {categorias.length > 0 ? (
          <button
            type="button"
            onClick={onAbrirOrdemCorredores}
            className="shrink-0 rounded-xl border border-blue-200/90 bg-white/90 px-3 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-[0.98]"
          >
            Ordem dos corredores
          </button>
        ) : null}
      </div>

      {itens.length > 0 ? (
        <div
          className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-600/10 via-white to-blue-50/90 px-4 py-3 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              {listaSimples ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-900/75">
                    Lista simples
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug text-slate-700">
                    Apenas marque o que já comprou. Sem valores no balanço
                    principal.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-900/75">
                    Total estimado (preço unit. × quantidade)
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-blue-950">
                    {formatarMoedaBRL(totalPrecos)}
                  </p>
                </>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
              <p className="text-center text-sm text-slate-700 sm:text-right">
                <span className="font-medium text-slate-600">Comprados:</span>{" "}
                <strong className="tabular-nums text-blue-700">
                  {contagemMercado.comprados}
                </strong>
                <span className="mx-2 text-slate-300" aria-hidden>
                  |
                </span>
                <span className="font-medium text-slate-600">Faltam:</span>{" "}
                <strong className="tabular-nums text-amber-800">
                  {contagemMercado.faltando}
                </strong>
              </p>
              <button
                type="button"
                disabled={!temComprados}
                onClick={() => {
                  if (contagemMercado.faltando > 0) {
                    setModalAvisoPendentesFinalizar(true);
                  } else {
                    setModalFinalizarAberto(true);
                  }
                }}
                className="min-h-[48px] w-full shrink-0 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Finalizar compras
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {itens.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/50 bg-white/40 px-4 py-8 text-center text-sm text-slate-600">
          {mercadoVazioMasExistemItensNoApp
            ? "Nenhum item na lista do mercado — os cadastrados continuam em Adicionar itens e em Comprar Novamente."
            : "Nenhum item ainda. Adicione acima para começar."}
        </p>
      ) : (
        <div className="space-y-6">
          {blocos.map((bloco) => (
            <div key={bloco.categoriaId ?? "todos"} className="space-y-2">
              {bloco.titulo ? (
                <h3 className="px-1 text-lg font-bold tracking-tight text-blue-950 [text-shadow:0_1px_0_rgb(255_255_255/0.85),0_2px_6px_rgb(15_23_42/0.35),0_4px_12px_rgb(15_23_42/0.12)]">
                  {bloco.titulo}
                </h3>
              ) : null}
              <motion.ul className="space-y-2" initial={false} layout>
                <AnimatePresence initial={false} mode="popLayout">
                  {bloco.itens.map((item) => (
                    <Item
                      key={item.id}
                      item={item}
                      onToggleMercado={aoAlternarMercado}
                      onPrecoChange={onPrecoChange}
                      onQuantidadeChange={onQuantidadeChange}
                      onRetirarDaListaMercado={onRetirarDaListaMercado}
                      listaSimples={listaSimples}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
