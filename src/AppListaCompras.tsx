import { AnimatePresence, motion } from "framer-motion";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InputAddItem } from "./components/InputAddItem";
import { ListaItensAdicionados } from "./components/ListaItensAdicionados";
import { ListaFaltando } from "./components/ListaFaltando";
import {
  ListaMercado,
  type ModoListaMercado,
} from "./components/ListaMercado";
import { ModalTipoListaMercado } from "./components/ModalTipoListaMercado";
import {
  type AbaId,
  NavegacaoAbas,
} from "./components/NavegacaoAbas";
import { ModalAgruparTipo } from "./components/ModalAgruparTipo";
import { ModalCategoriaNovoItem } from "./components/ModalCategoriaNovoItem";
import { ModalConfiguracoes } from "./components/ModalConfiguracoes";
import { ModalTutorial } from "./components/ModalTutorial";
import { ModalExcluirItens } from "./components/ModalExcluirItens";
import { ModalOrdemCorredores } from "./components/ModalOrdemCorredores";
import {
  ModalAvisoDuplicado,
  type TipoDuplicado,
} from "./components/ModalAvisoDuplicado";
import { ModalEscanearCodigo } from "./components/ModalEscanearCodigo";
import {
  type ResultadoMutacaoLista,
  useListaCompras,
} from "./hooks/useListaCompras";
import { LembretesCadencia } from "./components/LembretesCadencia";
import { nomeItemJaExiste, normalizarParaComparacao } from "./utils/duplicados";
import { calcularLembretesCadencia } from "./utils/lembretesCadencia";
import { BarraModoOffline } from "./components/BarraModoOffline";
import { FaixaDadosLocais } from "./components/FaixaDadosLocais";
import { ModalGerirListas } from "./components/ModalGerirListas";
import { ModalParabensPrimeiraLista } from "./components/ModalParabensPrimeiraLista";
import {
  SeletorListaViagem,
  SeletorListaViagemIcone,
} from "./components/SeletorListaViagem";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useFirestoreListaSync } from "./hooks/useFirestoreListaSync";
import {
  carregarSyncPrefs,
  salvarSyncPrefs,
} from "./services/syncPrefs";
import { hashSalaSync } from "./utils/salaSync";
import { publicarEstadoSomenteLeitura } from "./services/shareReadonlyFirestore";

const AbaBalancoPainel = lazy(() => import("./components/AbaBalanco"));

/** Evita repetir o tutorial automático em cada visita com lista vazia. */
const STORAGE_TUTORIAL_INICIAL = "listaCompra-tutorial-inicial-v1";

function avisoParaDuplicado(
  r: ResultadoMutacaoLista,
): TipoDuplicado | null {
  if (r.ok) return null;
  if (r.motivo === "item_duplicado") return "item";
  if (r.motivo === "categoria_duplicada") return "categoria";
  return null;
}

export function AppListaCompras() {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>("adicionar");
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalAgruparAberto, setModalAgruparAberto] = useState(false);
  const [nomeItemParaCategoria, setNomeItemParaCategoria] = useState<
    string | null
  >(null);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalGerirListasAberto, setModalGerirListasAberto] = useState(false);
  /** Abriu o modal pelo botão em realce laranja: placeholder animado no primeiro nome. */
  const [modalNomeListaComDicaAnimacao, setModalNomeListaComDicaAnimacao] =
    useState(false);
  const [modalParabensPrimeiraListaAberto, setModalParabensPrimeiraListaAberto] =
    useState(false);
  /** Após adicionar o primeiro item pelo modal de categoria: realça o botão «Nome da Lista». */
  const [realceBotaoNomeLista, setRealceBotaoNomeLista] = useState(false);
  const [modalTutorialAberto, setModalTutorialAberto] = useState(false);
  const [avisoDuplicado, setAvisoDuplicado] = useState<TipoDuplicado | null>(
    null,
  );
  const [modalOrdemCorredoresAberto, setModalOrdemCorredoresAberto] =
    useState(false);
  const [modalTipoListaMercadoAberto, setModalTipoListaMercadoAberto] =
    useState(false);
  const [modoListaMercado, setModoListaMercado] =
    useState<ModoListaMercado | null>(null);
  const [modalEscanearCodigoAberto, setModalEscanearCodigoAberto] =
    useState(false);
  const [syncPrefs, setSyncPrefs] = useState(carregarSyncPrefs);

  const online = useOnlineStatus();

  const {
    estadoLista,
    categorias,
    itens,
    itensNaListaDoMercado,
    comprasPorViagem,
    historicoComprasFinalizadas,
    viagensResumo,
    viagemAtivaId,
    selecionarViagem,
    criarViagem,
    renomearViagem,
    removerViagem,
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
    definirOrdemCorredoresCategoriaIds,
    criarCategoriaEAtribuirItens,
    zerarSistema,
    ordemCorredoresCategoriaIds,
    orcamentoReais,
    definirOrcamentoReais,
    substituirEstadoCompleto,
  } = useListaCompras();

  const syncAtivo =
    syncPrefs.ativo && syncPrefs.roomHash != null && syncPrefs.roomHash !== "";

  const { syncStatus, syncErro, firebaseConfigurado } = useFirestoreListaSync({
    hidratar,
    estadoLista,
    substituirEstadoCompleto,
    syncAtivo,
    roomHash: syncPrefs.roomHash,
  });

  const aoLigarSync = useCallback(async (nome: string, senha: string) => {
    const h = await hashSalaSync(nome, senha);
    const next = { ativo: true, roomHash: h };
    salvarSyncPrefs(next);
    setSyncPrefs(next);
  }, []);

  const aoDesligarSync = useCallback(() => {
    const next = { ativo: false, roomHash: null };
    salvarSyncPrefs(next);
    setSyncPrefs(next);
  }, []);

  const aoCriarLinkLeitura = useCallback(async () => {
    const id = await publicarEstadoSomenteLeitura(estadoLista);
    return `${window.location.origin}${window.location.pathname}#/ver/${id}`;
  }, [estadoLista]);

  useEffect(() => {
    if (firebaseConfigurado || !syncPrefs.ativo) return;
    const next = { ativo: false, roomHash: null as string | null };
    salvarSyncPrefs(next);
    setSyncPrefs(next);
  }, [firebaseConfigurado, syncPrefs.ativo]);

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

  const aoNomeDoCodigoBarras = useCallback(
    (nome: string) => {
      if (nomeItemJaExiste(itens, nome)) {
        setAvisoDuplicado("item");
        return;
      }
      setItemEditandoId(null);
      setNomeItemParaCategoria(nome);
    },
    [itens],
  );

  const itemEmEdicao = itemEditandoId
    ? itens.find((i) => i.id === itemEditandoId)
    : undefined;

  const lembretesCadencia = useMemo(() => {
    const nomesLista = new Set(
      itens.map((i) => normalizarParaComparacao(i.nome)),
    );
    return calcularLembretesCadencia(
      historicoComprasFinalizadas,
      Date.now(),
      nomesLista,
    );
  }, [historicoComprasFinalizadas, itens]);

  useEffect(() => {
    if (itemEditandoId && !itemEmEdicao) setItemEditandoId(null);
  }, [itemEditandoId, itemEmEdicao]);

  useEffect(() => {
    if (hidratar) return;
    if (itens.length > 0) return;
    try {
      if (localStorage.getItem(STORAGE_TUTORIAL_INICIAL) === "1") return;
    } catch {
      return;
    }
    try {
      localStorage.setItem(STORAGE_TUTORIAL_INICIAL, "1");
    } catch {
      /* ignore */
    }
    setAbaAtiva("adicionar");
    setModalTutorialAberto(true);
  }, [hidratar, itens.length]);

  const listaVazia = !hidratar && itens.length === 0;
  const temListaComNome = useMemo(
    () => viagensResumo.some((v) => v.nome.trim() !== ""),
    [viagensResumo],
  );
  /** Realces laranja (aba, input, modais) só até existir ≥1 item e ≥1 lista com nome. */
  const tutoriaisLaranjaPermitidos = !(
    itens.length >= 1 && temListaComNome
  );

  const [digitandoNomeNovoItem, setDigitandoNomeNovoItem] =
    useState(false);

  useEffect(() => {
    if (tutoriaisLaranjaPermitidos) return;
    setRealceBotaoNomeLista(false);
    setModalNomeListaComDicaAnimacao(false);
  }, [tutoriaisLaranjaPermitidos]);

  const aoTextoNovoItem = useCallback((temTexto: boolean) => {
    setDigitandoNomeNovoItem(temTexto);
  }, []);

  useEffect(() => {
    if (abaAtiva !== "adicionar") setDigitandoNomeNovoItem(false);
  }, [abaAtiva]);

  const tutorialDicaPrimeiroPasso =
    modalTutorialAberto && itens.length === 0;

  return (
    <div className="relative min-h-dvh">
      {!online ? <BarraModoOffline /> : null}

      <div
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-start gap-2 sm:left-4"
      >
        <button
          type="button"
          disabled={hidratar}
          onClick={() => setModalTutorialAberto(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
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
        <FaixaDadosLocais visivel={online} disabled={hidratar} />
      </div>

      <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-start gap-2 overflow-visible sm:right-4">
        <SeletorListaViagemIcone
          viagens={viagensResumo}
          viagemAtivaId={viagemAtivaId}
          onSelecionar={selecionarViagem}
          disabled={hidratar}
          mostrarBotaoCorredores={
            abaAtiva === "mercado" && categorias.length > 0
          }
          onAbrirOrdemCorredores={() =>
            setModalOrdemCorredoresAberto(true)
          }
        />
        <div className="relative flex shrink-0 flex-col items-center overflow-visible">
          <motion.button
            type="button"
            disabled={hidratar}
            onClick={() => {
              const comDica =
                realceBotaoNomeLista && tutoriaisLaranjaPermitidos;
              setRealceBotaoNomeLista(false);
              setModalNomeListaComDicaAnimacao(comDica);
              setModalGerirListasAberto(true);
            }}
            whileTap={{ scale: hidratar ? 1 : 0.96 }}
            animate={
              realceBotaoNomeLista && tutoriaisLaranjaPermitidos
                ? {
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.78, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(234, 88, 12, 0.95), 0 0 18px rgba(251, 146, 60, 0.55)",
                      "0 0 0 22px rgba(249, 115, 22, 0.4), 0 0 32px rgba(251, 146, 60, 0.65)",
                      "0 0 0 0 rgba(234, 88, 12, 0.95), 0 0 18px rgba(251, 146, 60, 0.55)",
                    ],
                  }
                : undefined
            }
            transition={
              realceBotaoNomeLista && tutoriaisLaranjaPermitidos
                ? {
                    duration: 0.85,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : undefined
            }
            className={[
              "relative z-[32] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:shadow disabled:cursor-not-allowed disabled:opacity-40",
              realceBotaoNomeLista && tutoriaisLaranjaPermitidos
                ? "border-orange-500 bg-gradient-to-br from-amber-100 via-orange-50 to-orange-200 text-orange-950 shadow-lg shadow-orange-400/45 ring-2 ring-orange-400/60 hover:from-amber-100 hover:to-orange-100"
                : "border-white/70 bg-white/85 text-slate-700 hover:bg-white",
            ].join(" ")}
            aria-label="Nome da Lista — gerir listas"
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
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </motion.button>
          {realceBotaoNomeLista && tutoriaisLaranjaPermitidos ? (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0.96, y: 2 }}
              animate={{ opacity: [1, 0.92, 1], y: [0, 2, 0] }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-1/2 top-full z-[31] mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-orange-300/95 bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-orange-900 shadow-md shadow-orange-200/60"
            >
              <span className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-orange-300/95 bg-white" />
              <span className="absolute -top-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-orange-200" />
              <span className="absolute -top-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-orange-200" />
              Clique aqui para dar um nome
              <br />
              a sua Lista
            </motion.div>
          ) : null}
        </div>
        <button
          type="button"
          disabled={hidratar}
          onClick={() => setModalConfigAberto(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white hover:shadow active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
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
      </div>

      <div
        className={[
          "relative mx-auto flex max-w-lg flex-col gap-5 overflow-x-hidden px-4 pb-28",
          online
            ? "max-md:pt-[calc(max(0.75rem,env(safe-area-inset-top))+3.25rem)] md:pt-[max(1.25rem,env(safe-area-inset-top))]"
            : "max-md:pt-[calc(max(1.25rem,env(safe-area-inset-top))+3.75rem+1.75rem)] md:pt-[calc(max(1.25rem,env(safe-area-inset-top))+3.75rem)]",
        ].join(" ")}
      >
        <motion.div
          layout
          className="hidden rounded-2xl border border-transparent bg-transparent px-0 py-1 shadow-none sm:px-1 md:block"
        >
          <SeletorListaViagem
            viagens={viagensResumo}
            viagemAtivaId={viagemAtivaId}
            onSelecionar={selecionarViagem}
            disabled={hidratar}
            mostrarBotaoCorredores={
              abaAtiva === "mercado" && categorias.length > 0
            }
            onAbrirOrdemCorredores={() =>
              setModalOrdemCorredoresAberto(true)
            }
          />
          <div className="h-3" aria-hidden />
        </motion.div>

        <NavegacaoAbas
          abaAtiva={abaAtiva}
          onMudarAba={setAbaAtiva}
          onIrListaMercado={irParaListaMercado}
          disabled={hidratar}
          realcarAbaAdicionar={
            listaVazia &&
            !digitandoNomeNovoItem &&
            tutoriaisLaranjaPermitidos
          }
        />

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
                  key={viagemAtivaId}
                  itens={itensNaListaDoMercado}
                  categorias={categorias}
                  ordemCorredoresCategoriaIds={ordemCorredoresCategoriaIds}
                  modoLista={modoListaMercado}
                  mercadoVazioMasExistemItensNoApp={
                    itens.length > 0 && itensNaListaDoMercado.length === 0
                  }
                  orcamentoReais={orcamentoReais}
                  onOrcamentoChange={definirOrcamentoReais}
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
                  ordemCorredoresCategoriaIds={ordemCorredoresCategoriaIds}
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
                  <AbaBalancoPainel comprasPorViagem={comprasPorViagem} />
                </Suspense>
              ) : null}

              {abaAtiva === "adicionar" ? (
                <section className="space-y-6" aria-labelledby="titulo-adicionar">
                  <h2 id="titulo-adicionar" className="sr-only">
                    Adicionar itens
                  </h2>
                  <LembretesCadencia
                    lembretes={lembretesCadencia}
                    disabled={hidratar}
                    onEscolher={(nome) => {
                      if (nomeItemJaExiste(itens, nome)) {
                        setAvisoDuplicado("item");
                        return;
                      }
                      setItemEditandoId(null);
                      setNomeItemParaCategoria(nome);
                    }}
                  />
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-blue-950">
                      Novo item
                    </h3>
                    <InputAddItem
                      historicoCompras={historicoComprasFinalizadas}
                      itensAtuais={itens}
                      tutorialLaranjaAtivo={tutoriaisLaranjaPermitidos}
                      onTextoNovoItemChange={aoTextoNovoItem}
                      onPedirCategoria={(nome) => {
                        if (nomeItemJaExiste(itens, nome)) {
                          setAvisoDuplicado("item");
                          return false;
                        }
                        setItemEditandoId(null);
                        setNomeItemParaCategoria(nome);
                        return true;
                      }}
                      onEscanear={() => setModalEscanearCodigoAberto(true)}
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
        tutorialLaranjaAtivo={tutoriaisLaranjaPermitidos}
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
            if (r.ok && !temListaComNome) setRealceBotaoNomeLista(true);
            return r.ok;
          }
          return true;
        }}
      />
      <ModalOrdemCorredores
        aberto={modalOrdemCorredoresAberto}
        categorias={categorias}
        ordemAtualIds={ordemCorredoresCategoriaIds}
        onFechar={() => setModalOrdemCorredoresAberto(false)}
        onSalvar={(ids) => definirOrdemCorredoresCategoriaIds(ids)}
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
        mostrarDicaPrimeiroPasso={tutorialDicaPrimeiroPasso}
      />
      <ModalGerirListas
        aberto={modalGerirListasAberto}
        onFechar={() => {
          setModalGerirListasAberto(false);
          setModalNomeListaComDicaAnimacao(false);
        }}
        viagens={viagensResumo}
        viagemAtivaId={viagemAtivaId}
        onCriar={criarViagem}
        onRenomear={renomearViagem}
        onRemover={removerViagem}
        disabled={hidratar}
        dicaAnimacaoPlaceholder={
          modalNomeListaComDicaAnimacao && tutoriaisLaranjaPermitidos
        }
        tutorialLaranjaAtivo={tutoriaisLaranjaPermitidos}
        onPrimeiroNomeGuardado={() =>
          setModalParabensPrimeiraListaAberto(true)
        }
        mostrarOrdemCorredores={categorias.length > 0}
        onAbrirOrdemCorredores={() => {
          setModalGerirListasAberto(false);
          setModalNomeListaComDicaAnimacao(false);
          setModalOrdemCorredoresAberto(true);
        }}
      />
      <ModalParabensPrimeiraLista
        aberto={modalParabensPrimeiraListaAberto}
        onFechar={() => setModalParabensPrimeiraListaAberto(false)}
      />
      <ModalConfiguracoes
        aberto={modalConfigAberto}
        onFechar={() => setModalConfigAberto(false)}
        onZerarSistema={zerarSistema}
        firebaseConfigurado={firebaseConfigurado}
        syncAtivo={syncAtivo}
        syncStatus={syncStatus}
        syncErro={syncErro}
        onLigarSync={aoLigarSync}
        onDesligarSync={aoDesligarSync}
        onCriarLinkLeitura={aoCriarLinkLeitura}
      />
      <ModalEscanearCodigo
        aberto={modalEscanearCodigoAberto}
        onFechar={() => setModalEscanearCodigoAberto(false)}
        onNomeDetectado={aoNomeDoCodigoBarras}
      />
      <ModalAvisoDuplicado
        aberto={avisoDuplicado !== null}
        tipo={avisoDuplicado ?? "item"}
        onFechar={() => setAvisoDuplicado(null)}
      />
    </div>
  );
}
