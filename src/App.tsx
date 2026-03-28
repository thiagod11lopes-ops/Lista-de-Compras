import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { InputAddItem } from "./components/InputAddItem";
import { ListaItensAdicionados } from "./components/ListaItensAdicionados";
import { ListaFaltando } from "./components/ListaFaltando";
import {
  ListaMercado,
  type ModoListaMercado,
} from "./components/ListaMercado";
import { ModalTipoListaMercado } from "./components/ModalTipoListaMercado";
import { BotaoListaMercado } from "./components/BotaoListaMercado";
import {
  type AbaId,
  NavegacaoAbas,
} from "./components/NavegacaoAbas";
import { ModalAgruparTipo } from "./components/ModalAgruparTipo";
import { ModalCategoriaNovoItem } from "./components/ModalCategoriaNovoItem";
import { ModalConfiguracoes } from "./components/ModalConfiguracoes";
import { ModalTutorial } from "./components/ModalTutorial";
import { ModalExcluirItens } from "./components/ModalExcluirItens";
import {
  ModalAvisoDuplicado,
  type TipoDuplicado,
} from "./components/ModalAvisoDuplicado";
import {
  type ResultadoMutacaoLista,
  useListaCompras,
} from "./hooks/useListaCompras";
import { nomeItemJaExiste } from "./utils/duplicados";

const AbaBalancoPainel = lazy(() => import("./components/AbaBalanco"));

function avisoParaDuplicado(
  r: ResultadoMutacaoLista,
): TipoDuplicado | null {
  if (r.ok) return null;
  if (r.motivo === "item_duplicado") return "item";
  if (r.motivo === "categoria_duplicada") return "categoria";
  return null;
}

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>("adicionar");
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAgruparAberto, setModalAgruparAberto] = useState(false);
  const [nomeItemParaCategoria, setNomeItemParaCategoria] = useState<
    string | null
  >(null);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalTutorialAberto, setModalTutorialAberto] = useState(false);
  const [avisoDuplicado, setAvisoDuplicado] = useState<TipoDuplicado | null>(
    null,
  );
  const {
    categorias,
    itens,
    itensNaListaDoMercado,
    comprasFinalizadas,
    itensComprarNovamente,
    hidratar,
    adicionarItemComCategoria,
    atualizarItem,
    alternarComprado,
    alternarItemNaListaDoMercado,
    retirarDaListaDoMercado,
    definirPrecoItem,
    definirQuantidadeItem,
    removerItensPorIds,
    finalizarCompras,
    definirModoListaMercado,
    criarCategoriaEAtribuirItens,
    zerarSistema,
  } = useListaCompras();

  const [modalTipoListaMercadoAberto, setModalTipoListaMercadoAberto] =
    useState(false);
  const [modoListaMercado, setModoListaMercado] =
    useState<ModoListaMercado | null>(null);

  const irParaListaMercado = useCallback(() => {
    setAbaAtiva("mercado");
    setModoListaMercado(null);
    setModalTipoListaMercadoAberto(true);
  }, []);

  useEffect(() => {
    if (abaAtiva !== "mercado") {
      setModoListaMercado(null);
      setModalTipoListaMercadoAberto(false);
    }
  }, [abaAtiva]);

  const aoEscolherListaSimples = useCallback(() => {
    definirModoListaMercado("simples");
    setModoListaMercado("simples");
    setModalTipoListaMercadoAberto(false);
  }, [definirModoListaMercado]);

  const aoEscolherListaCompleta = useCallback(() => {
    definirModoListaMercado("completa");
    setModoListaMercado("completa");
    setModalTipoListaMercadoAberto(false);
  }, [definirModoListaMercado]);

  const fecharModalTipoListaMercado = useCallback(() => {
    setModalTipoListaMercadoAberto(false);
  }, []);

  const itemEmEdicao = itemEditandoId
    ? itens.find((i) => i.id === itemEditandoId)
    : undefined;

  useEffect(() => {
    if (itemEditandoId && !itemEmEdicao) setItemEditandoId(null);
  }, [itemEditandoId, itemEmEdicao]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <button
        type="button"
        disabled={hidratar}
        onClick={() => setModalTutorialAberto(true)}
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 sm:left-4"
        aria-label="Tutorial — como usar o app"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      </button>

      <button
        type="button"
        disabled={hidratar}
        onClick={() => setModalConfigAberto(true)}
        className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 sm:right-4"
        aria-label="Configurações"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <div className="relative mx-auto flex max-w-lg flex-col gap-5 px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <motion.div
          layout
          className="rounded-2xl border border-transparent bg-transparent px-4 py-3 shadow-none"
          aria-hidden="true"
        >
          <div className="h-5" />
        </motion.div>

        <BotaoListaMercado
          disabled={hidratar}
          ativo={abaAtiva === "mercado"}
          onIrMercado={irParaListaMercado}
        />

        <NavegacaoAbas abaAtiva={abaAtiva} onMudarAba={setAbaAtiva} />

        {hidratar ? (
          <p className="text-center text-sm text-slate-500">Carregando…</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={abaAtiva}
              role="tabpanel"
              aria-labelledby={`tab-${abaAtiva}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="min-h-[12rem]"
            >
              {abaAtiva === "mercado" && modoListaMercado != null ? (
                <ListaMercado
                  itens={itensNaListaDoMercado}
                  categorias={categorias}
                  modoLista={modoListaMercado}
                  mercadoVazioMasExistemItensNoApp={
                    itens.length > 0 && itensNaListaDoMercado.length === 0
                  }
                  onToggle={alternarComprado}
                  onPrecoChange={definirPrecoItem}
                  onQuantidadeChange={definirQuantidadeItem}
                  onRetirarDaListaMercado={retirarDaListaDoMercado}
                  onFinalizarCompras={finalizarCompras}
                />
              ) : null}

              {abaAtiva === "faltando" ? (
                <ListaFaltando
                  itens={itensComprarNovamente}
                  categorias={categorias}
                  onAlternarListaMercado={alternarItemNaListaDoMercado}
                />
              ) : null}

              {abaAtiva === "balanco" ? (
                <Suspense
                  fallback={
                    <p className="py-8 text-center text-sm text-slate-500">
                      Carregando balanço…
                    </p>
                  }
                >
                  <AbaBalancoPainel comprasFinalizadas={comprasFinalizadas} />
                </Suspense>
              ) : null}

              {abaAtiva === "adicionar" ? (
                <section className="space-y-6" aria-labelledby="titulo-adicionar">
                  <h2 id="titulo-adicionar" className="sr-only">
                    Adicionar itens
                  </h2>
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-blue-950">
                      Novo item
                    </h3>
                    <InputAddItem
                      onPedirCategoria={(nome) => {
                        if (nomeItemJaExiste(itens, nome)) {
                          setAvisoDuplicado("item");
                          return false;
                        }
                        setItemEditandoId(null);
                        setNomeItemParaCategoria(nome);
                        return true;
                      }}
                      disabled={hidratar}
                    />
                  </div>
                  <ListaItensAdicionados
                    itens={itens}
                    categorias={categorias}
                    disabled={hidratar}
                    onEditar={(id) => {
                      setNomeItemParaCategoria(null);
                      setItemEditandoId(id);
                    }}
                    onExcluir={(id) => {
                      const alvo = itens.find((i) => i.id === id);
                      if (!alvo) return;
                      if (
                        window.confirm(
                          `Excluir "${alvo.nome}" da lista de itens?`,
                        )
                      ) {
                        removerItensPorIds([id]);
                        if (itemEditandoId === id) setItemEditandoId(null);
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setModalExcluirAberto(true)}
                      disabled={itens.length === 0 || hidratar}
                      className="min-h-[48px] w-full rounded-xl border border-red-200/90 bg-red-50 px-4 text-sm font-semibold text-red-800 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[10rem]"
                    >
                      Limpar lista
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAgruparAberto(true)}
                      disabled={itens.length === 0 || hidratar}
                      className="min-h-[48px] w-full rounded-xl border border-blue-200/90 bg-blue-50 px-4 text-sm font-semibold text-blue-900 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[10rem]"
                    >
                      Agrupar por tipo
                    </button>
                  </div>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <ModalExcluirItens
        aberto={modalExcluirAberto}
        itens={itens}
        onFechar={() => setModalExcluirAberto(false)}
        onExcluirSelecionados={(ids) => removerItensPorIds(ids)}
      />
      <ModalAgruparTipo
        aberto={modalAgruparAberto}
        itens={itens}
        onFechar={() => setModalAgruparAberto(false)}
        onConfirmar={(titulo, ids) => {
          const r = criarCategoriaEAtribuirItens(titulo, ids);
          const aviso = avisoParaDuplicado(r);
          if (aviso) setAvisoDuplicado(aviso);
          return r.ok;
        }}
      />
      <ModalCategoriaNovoItem
        aberto={
          nomeItemParaCategoria !== null ||
          (itemEditandoId !== null && itemEmEdicao !== undefined)
        }
        modoEdicao={itemEmEdicao !== undefined}
        valorInicialEdicao={
          itemEmEdicao
            ? {
                nome: itemEmEdicao.nome,
                categoriaId: itemEmEdicao.categoriaId ?? null,
                unidadeLista: itemEmEdicao.unidadeLista ?? "un",
              }
            : undefined
        }
        nomeItem={nomeItemParaCategoria ?? ""}
        categorias={categorias}
        onFechar={() => {
          setNomeItemParaCategoria(null);
          setItemEditandoId(null);
        }}
        onConfirmar={(escolha) => {
          if (itemEmEdicao) {
            const nome = escolha.nomeItemEditado?.trim() ?? "";
            if (!nome) return false;
            const r = atualizarItem(itemEmEdicao.id, {
              nome,
              categoriaIdExistente: escolha.categoriaIdExistente,
              novaCategoriaTitulo: escolha.novaCategoriaTitulo,
              unidadeLista: escolha.unidadeLista,
            });
            const aviso = avisoParaDuplicado(r);
            if (aviso) setAvisoDuplicado(aviso);
            return r.ok;
          }
          if (nomeItemParaCategoria) {
            const r = adicionarItemComCategoria(
              nomeItemParaCategoria,
              escolha,
            );
            const aviso = avisoParaDuplicado(r);
            if (aviso) setAvisoDuplicado(aviso);
            return r.ok;
          }
          return true;
        }}
      />
      <ModalTipoListaMercado
        aberto={modalTipoListaMercadoAberto && abaAtiva === "mercado"}
        onEscolherSimples={aoEscolherListaSimples}
        onEscolherCompleta={aoEscolherListaCompleta}
        onFechar={fecharModalTipoListaMercado}
      />
      <ModalTutorial
        aberto={modalTutorialAberto}
        onFechar={() => setModalTutorialAberto(false)}
      />
      <ModalConfiguracoes
        aberto={modalConfigAberto}
        onFechar={() => setModalConfigAberto(false)}
        onZerarSistema={zerarSistema}
      />
      <ModalAvisoDuplicado
        aberto={avisoDuplicado !== null}
        tipo={avisoDuplicado ?? "item"}
        onFechar={() => setAvisoDuplicado(null)}
      />
    </div>
  );
}
