import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Categoria, ItemCompra } from "../types/item";
import {
  linhasTotaisComprados,
  linhasTotaisCompradosPorCategoria,
  podeMarcarComoComprado,
  precoPreenchido,
  quantidadePreenchida,
  somaTotaisLinhas,
  subtotalLinhaMercado,
} from "../utils/itemMercado";
import { formatarMoedaBRL, parsearEntradaMoeda } from "../utils/moeda";
import { blocosPorCategoria } from "../utils/agruparItens";
import { Item } from "./Item";
import { ModalAvisoPendentesFinalizar } from "./ModalAvisoPendentesFinalizar";
import { ModalAvisoValidacaoMercado } from "./ModalAvisoValidacaoMercado";
import { ModalFinalizarCompras } from "./ModalFinalizarCompras";

const FAB_POS_STORAGE_KEY = "listaMercado-fab-pos-v1";

const STORAGE_DICA_ORCAMENTO_LISTA_COMPLETA =
  "listaCompra-dica-orcamento-lista-completa-v1";

const FRASE_DICA_ORCAMENTO =
  "Adicione um orçamento para essa compra aqui";

function lerDicaOrcamentoListaCompletaJaVista(): boolean {
  try {
    return localStorage.getItem(STORAGE_DICA_ORCAMENTO_LISTA_COMPLETA) === "1";
  } catch {
    return false;
  }
}

function marcarDicaOrcamentoListaCompletaVista() {
  try {
    localStorage.setItem(STORAGE_DICA_ORCAMENTO_LISTA_COMPLETA, "1");
  } catch {
    /* ignore */
  }
}

const STORAGE_DICA_PAINEL_FLUTUANTE =
  "listaCompra-dica-painel-flutuante-v1";

const FRASE_DICA_PAINEL_FLUTUANTE =
  "Clique aqui para tornar o campo flutuante";

function lerDicaPainelFlutuanteJaVista(): boolean {
  try {
    return localStorage.getItem(STORAGE_DICA_PAINEL_FLUTUANTE) === "1";
  } catch {
    return false;
  }
}

function marcarDicaPainelFlutuanteVista() {
  try {
    localStorage.setItem(STORAGE_DICA_PAINEL_FLUTUANTE, "1");
  } catch {
    /* ignore */
  }
}

const STORAGE_TUTORIAL_FLUTUANTE_ITENS_OK =
  "listaCompra-tutorial-flutuante-itens-v1";

function lerTutorialFlutuanteItensCompleto(): boolean {
  try {
    return localStorage.getItem(STORAGE_TUTORIAL_FLUTUANTE_ITENS_OK) === "1";
  } catch {
    return false;
  }
}

function marcarTutorialFlutuanteItensCompleto() {
  try {
    localStorage.setItem(STORAGE_TUTORIAL_FLUTUANTE_ITENS_OK, "1");
  } catch {
    /* ignore */
  }
}

type FabPos = { left: number; top: number };

/** Margem inferior extra (barra do Safari / home indicator no iPhone). */
function viewportSize(): { vw: number; vh: number } {
  if (typeof window === "undefined") return { vw: 320, vh: 600 };
  const vv = window.visualViewport;
  return {
    vw: vv?.width ?? window.innerWidth,
    vh: vv?.height ?? window.innerHeight,
  };
}

function clampFabPos(
  p: FabPos,
  panelW: number,
  panelH: number,
  vw: number,
  vh: number,
): FabPos {
  const m = 8;
  const bottomSafe = 36;
  const maxTop = Math.max(m, vh - panelH - m - bottomSafe);
  return {
    left: Math.min(Math.max(m, p.left), Math.max(m, vw - panelW - m)),
    top: Math.min(Math.max(m, p.top), maxTop),
  };
}

function loadFabPos(): FabPos | null {
  try {
    const raw = localStorage.getItem(FAB_POS_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as FabPos;
    if (typeof p.left === "number" && typeof p.top === "number") return p;
  } catch {
    /* ignore */
  }
  return null;
}

function saveFabPos(p: FabPos) {
  try {
    localStorage.setItem(FAB_POS_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

type StatusOrcamentoChip = {
  r: number;
  larguraBarraPct: number;
  barraClass: string;
  aviso: string | null;
  avisoClass: string;
};

function estiloPainelFlutuante(
  listaSimples: boolean,
  status: StatusOrcamentoChip | null,
): { panel: string; btn: string } {
  if (listaSimples) {
    return {
      panel:
        "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-white shadow-lg shadow-emerald-900/20",
      btn:
        "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md shadow-emerald-600/30",
    };
  }
  if (!status) {
    return {
      panel:
        "border-blue-200/90 bg-gradient-to-br from-blue-50/95 via-white to-white shadow-lg shadow-blue-900/20",
      btn:
        "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/25",
    };
  }
  const { r } = status;
  if (r >= 1) {
    return {
      panel:
        "border-red-300/90 bg-gradient-to-br from-red-50/95 via-white to-white shadow-lg shadow-red-900/20",
      btn: "bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-600/30",
    };
  }
  if (r >= 0.9) {
    return {
      panel:
        "border-orange-300/90 bg-gradient-to-br from-orange-50/95 via-white to-white shadow-lg shadow-orange-900/20",
      btn:
        "bg-gradient-to-r from-orange-600 to-orange-500 shadow-md shadow-orange-600/30",
    };
  }
  if (r >= 0.8) {
    return {
      panel:
        "border-amber-300/90 bg-gradient-to-br from-amber-50/95 via-white to-white shadow-lg shadow-amber-900/20",
      btn:
        "bg-gradient-to-r from-amber-600 to-amber-500 shadow-md shadow-amber-600/25",
    };
  }
  return {
    panel:
      "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-white shadow-lg shadow-emerald-900/20",
    btn:
      "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-md shadow-emerald-600/30",
  };
}

type PainelFlutuanteResumoMercadoProps = {
  listaSimples: boolean;
  totalPrecos: number;
  statusOrcamento: StatusOrcamentoChip | null;
  temComprados: boolean;
  onFinalizarClick: () => void;
  onExpandir: () => void;
};

function PainelFlutuanteResumoMercado({
  listaSimples,
  totalPrecos,
  statusOrcamento,
  temComprados,
  onFinalizarClick,
  onExpandir,
}: PainelFlutuanteResumoMercadoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pid: number;
    startX: number;
    startY: number;
    orig: FabPos;
  } | null>(null);
  const [pos, setPos] = useState<FabPos>(() => {
    if (typeof window === "undefined") return { left: 16, top: 120 };
    const saved = loadFabPos();
    if (saved) return saved;
    const { vw, vh } = viewportSize();
    return {
      left: Math.max(8, vw - 136),
      top: Math.max(8, vh - 120),
    };
  });

  const reajustarAoViewport = useCallback(() => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const { vw, vh } = viewportSize();
    setPos((p) => clampFabPos(p, r.width, r.height, vw, vh));
  }, []);

  useLayoutEffect(() => {
    reajustarAoViewport();
  }, [reajustarAoViewport]);

  useEffect(() => {
    const onResize = () => reajustarAoViewport();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, [reajustarAoViewport]);

  const estilo = estiloPainelFlutuante(listaSimples, statusOrcamento);

  const onHandlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      pid: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...pos },
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const el = rootRef.current;
    const { vw, vh } = viewportSize();
    const w = el?.offsetWidth ?? 130;
    const h = el?.offsetHeight ?? 60;
    setPos(
      clampFabPos(
        { left: d.orig.left + dx, top: d.orig.top + dy },
        w,
        h,
        vw,
        vh,
      ),
    );
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setPos((p) => {
      saveFabPos(p);
      return p;
    });
  };

  const onAreaExpandirClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onExpandir();
  };

  const onFinalizarPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      ref={rootRef}
      role="complementary"
      aria-label="Resumo da lista do mercado (arraste pela barra lateral)"
      className={[
        "fixed z-[200] flex w-[min(8.75rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] select-none overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm [padding-bottom:max(0.125rem,env(safe-area-inset-bottom))]",
        estilo.panel,
      ].join(" ")}
      style={{ left: pos.left, top: pos.top }}
    >
      <button
        type="button"
        aria-label="Arrastar painel"
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        className="flex w-5 shrink-0 cursor-grab touch-none items-center justify-center border-r border-black/5 bg-black/[0.03] active:cursor-grabbing"
      >
        <span className="flex flex-col gap-px" aria-hidden>
          <span className="h-px w-2 rounded-full bg-slate-400/80" />
          <span className="h-px w-2 rounded-full bg-slate-400/80" />
          <span className="h-px w-2 rounded-full bg-slate-400/80" />
        </span>
      </button>
      <div
        className={[
          "flex min-w-0 flex-1 cursor-pointer flex-col px-1.5 py-1.5 pl-1",
          listaSimples || !statusOrcamento ? "gap-1" : "gap-0.5",
        ].join(" ")}
        onClick={onAreaExpandirClick}
        aria-label="Abrir resumo completo no topo da lista"
      >
        {listaSimples ? (
          <>
            <p className="text-[8px] font-semibold uppercase leading-tight tracking-wide text-emerald-900/80">
              Lista simples
            </p>
            <p className="text-[9px] leading-tight text-slate-600">
              Toque p/ resumo
            </p>
          </>
        ) : (
          <>
            <p className="text-[8px] font-semibold uppercase leading-tight tracking-wide text-slate-600">
              Total estim.
            </p>
            {statusOrcamento ? (
              <div
                className="h-1 w-full shrink-0 overflow-hidden rounded-full bg-slate-200/90"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(statusOrcamento.larguraBarraPct)}
                aria-label="Percentual do orçamento usado pelo total estimado"
              >
                <div
                  className={[
                    "h-full rounded-full transition-[width] duration-300 ease-out",
                    statusOrcamento.barraClass,
                  ].join(" ")}
                  style={{
                    width: `${statusOrcamento.larguraBarraPct}%`,
                  }}
                />
              </div>
            ) : null}
            <div className="flex min-w-0 items-baseline justify-between gap-1 leading-none">
              <p className="min-w-0 text-xs font-bold tabular-nums text-slate-900">
                {formatarMoedaBRL(totalPrecos)}
              </p>
              {statusOrcamento ? (
                <span className="shrink-0 text-[9px] font-semibold tabular-nums text-slate-600">
                  {(statusOrcamento.r * 100).toFixed(0)}%
                </span>
              ) : null}
            </div>
          </>
        )}
        <button
          type="button"
          disabled={!temComprados}
          onPointerDown={onFinalizarPointerDown}
          onClick={(e) => {
            e.stopPropagation();
            onFinalizarClick();
          }}
          className={[
            "min-h-[32px] w-full rounded-lg px-1 py-1 text-center text-[9px] font-semibold leading-tight text-white transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
            estilo.btn,
          ].join(" ")}
        >
          Finalizar
          <br />
          compras
        </button>
      </div>
    </div>,
    document.body,
  );
}

export type ModoListaMercado = "simples" | "completa";

type Props = {
  itens: ItemCompra[];
  categorias: Categoria[];
  /** Ordem dos grupos (corredores) na loja habitual. */
  ordemCorredoresCategoriaIds: string[];
  modoLista: ModoListaMercado;
  /** Quando não há linhas no mercado mas ainda existem itens no app (só fora desta lista). */
  mercadoVazioMasExistemItensNoApp?: boolean;
  /** Limite em R$ para esta lista (lista completa). */
  orcamentoReais?: number | null;
  onOrcamentoChange?: (valor: number | null) => void;
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
  orcamentoReais = null,
  onOrcamentoChange,
  onToggle,
  onPrecoChange,
  onQuantidadeChange,
  onRetirarDaListaMercado,
  onFinalizarCompras,
}: Props) {
  const listaSimples = modoLista === "simples";
  const orcamentoAtivo = !listaSimples && onOrcamentoChange != null;
  const [modalAvisoValidacao, setModalAvisoValidacao] = useState<{
    nomeItem: string;
    msg: string;
  } | null>(null);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [modalAvisoPendentesFinalizar, setModalAvisoPendentesFinalizar] =
    useState(false);
  const [painelOrcamentoVisivel, setPainelOrcamentoVisivel] = useState(true);
  /** `true`: cartão completo no fluxo; `false`: só o painel flutuante (total + finalizar). */
  const [resumoMercadoExpandido, setResumoMercadoExpandido] = useState(true);
  const [dicaOrcamentoListaCompletaVista, setDicaOrcamentoListaCompletaVista] =
    useState(lerDicaOrcamentoListaCompletaJaVista);
  const [charsFraseOrc, setCharsFraseOrc] = useState(0);
  /** Durante o foco no orçamento, texto livre; fora, valor vem de `orcamentoReais` formatado. */
  const [orcamentoCampoRascunho, setOrcamentoCampoRascunho] = useState<
    string | null
  >(null);
  const [dicaPainelFlutuanteVista, setDicaPainelFlutuanteVista] = useState(
    lerDicaPainelFlutuanteJaVista,
  );
  /** Após minimizar o resumo: tutorial preço/qtd → checkbox no 1.º item não comprado. */
  const [tutorialFlutuanteItemId, setTutorialFlutuanteItemId] = useState<
    string | null
  >(null);
  const [faseTutorialFlutuanteItens, setFaseTutorialFlutuanteItens] = useState<
    "preco-qtd" | "checkbox" | null
  >(null);

  /** Primeira utilização da lista completa: balão + pulso até sair do campo (blur), não na 1.ª tecla. */
  const emTutorialOrcamento =
    orcamentoAtivo && !dicaOrcamentoListaCompletaVista;
  const mostrarDestaqueOrcamentoCampo = emTutorialOrcamento;

  useEffect(() => {
    if (!mostrarDestaqueOrcamentoCampo) {
      setCharsFraseOrc(0);
      return;
    }
    setCharsFraseOrc(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCharsFraseOrc(i);
      if (i >= FRASE_DICA_ORCAMENTO.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [mostrarDestaqueOrcamentoCampo]);

  /** Após 1.º orçamento válido: destaque no botão de minimizar o resumo (painel flutuante). */
  const mostrarDicaPainelFlutuante =
    !listaSimples &&
    orcamentoAtivo &&
    orcamentoReais != null &&
    orcamentoReais > 0 &&
    !dicaPainelFlutuanteVista &&
    resumoMercadoExpandido;

  const aoMinimizarResumoMercado = useCallback(() => {
    const marcarAoMinimizar =
      !listaSimples &&
      orcamentoAtivo &&
      orcamentoReais != null &&
      orcamentoReais > 0 &&
      !dicaPainelFlutuanteVista;
    if (marcarAoMinimizar) {
      marcarDicaPainelFlutuanteVista();
      setDicaPainelFlutuanteVista(true);
    }
    setResumoMercadoExpandido(false);
  }, [
    listaSimples,
    orcamentoAtivo,
    orcamentoReais,
    dicaPainelFlutuanteVista,
  ]);

  useEffect(() => {
    if (lerTutorialFlutuanteItensCompleto()) return;
    if (listaSimples || resumoMercadoExpandido) return;
    if (orcamentoReais == null || orcamentoReais <= 0) return;
    if (tutorialFlutuanteItemId != null) return;
    const primeiro = itens.find((i) => !i.comprado);
    if (!primeiro) return;
    setTutorialFlutuanteItemId(primeiro.id);
    setFaseTutorialFlutuanteItens(
      podeMarcarComoComprado(primeiro) ? "checkbox" : "preco-qtd",
    );
  }, [
    listaSimples,
    resumoMercadoExpandido,
    orcamentoReais,
    itens,
    tutorialFlutuanteItemId,
  ]);

  useEffect(() => {
    if (
      faseTutorialFlutuanteItens !== "preco-qtd" ||
      !tutorialFlutuanteItemId ||
      lerTutorialFlutuanteItensCompleto()
    ) {
      return;
    }
    const it = itens.find((i) => i.id === tutorialFlutuanteItemId);
    if (it && podeMarcarComoComprado(it)) {
      setFaseTutorialFlutuanteItens("checkbox");
    }
  }, [itens, faseTutorialFlutuanteItens, tutorialFlutuanteItemId]);

  useEffect(() => {
    if (
      faseTutorialFlutuanteItens !== "checkbox" ||
      !tutorialFlutuanteItemId ||
      lerTutorialFlutuanteItensCompleto()
    ) {
      return;
    }
    const it = itens.find((i) => i.id === tutorialFlutuanteItemId);
    if (it?.comprado) {
      marcarTutorialFlutuanteItensCompleto();
      setTutorialFlutuanteItemId(null);
      setFaseTutorialFlutuanteItens(null);
    }
  }, [itens, faseTutorialFlutuanteItens, tutorialFlutuanteItemId]);

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

  const statusOrcamento = useMemo(() => {
    if (
      !orcamentoAtivo ||
      orcamentoReais == null ||
      orcamentoReais <= 0
    ) {
      return null;
    }
    const r = totalPrecos / orcamentoReais;
    const larguraBarraPct = Math.min(100, r * 100);
    let barraClass =
      "bg-emerald-500 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]";
    let aviso: string | null = null;
    let avisoClass = "text-slate-600";
    if (r >= 1) {
      barraClass =
        "bg-red-600 shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]";
      aviso = `Total estimado ultrapassou o orçamento (${formatarMoedaBRL(orcamentoReais)}).`;
      avisoClass = "font-semibold text-red-800";
    } else if (r >= 0.9) {
      barraClass =
        "bg-orange-500 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]";
      aviso = `Quase no limite do orçamento: cerca de ${(r * 100).toFixed(0)}% usados.`;
      avisoClass = "font-medium text-orange-900";
    } else if (r >= 0.8) {
      barraClass =
        "bg-amber-400 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]";
      aviso = `Aproximando do orçamento: cerca de ${(r * 100).toFixed(0)}% usados.`;
      avisoClass = "text-amber-950";
    }
    return { r, larguraBarraPct, barraClass, aviso, avisoClass };
  }, [orcamentoAtivo, orcamentoReais, totalPrecos]);

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

  const aoFinalizarComprasMercado = useCallback(() => {
    if (contagemMercado.faltando > 0) {
      setModalAvisoPendentesFinalizar(true);
    } else {
      setModalFinalizarAberto(true);
    }
  }, [contagemMercado.faltando]);

  const estavaResumoExpandido = useRef(resumoMercadoExpandido);
  useEffect(() => {
    if (resumoMercadoExpandido && !estavaResumoExpandido.current) {
      const id = window.setTimeout(() => {
        document
          .getElementById("resumo-mercado-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return () => clearTimeout(id);
    }
    estavaResumoExpandido.current = resumoMercadoExpandido;
  }, [resumoMercadoExpandido]);

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
    <section className="space-y-3" aria-label="Iniciar compras">
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
      {itens.length > 0 ? (
        <>
          {resumoMercadoExpandido ? (
        <div
          id="resumo-mercado-anchor"
          className="isolate overflow-visible rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-600/10 via-white to-blue-50/90 px-4 py-3 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
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
                onClick={aoFinalizarComprasMercado}
                className="min-h-[48px] w-full shrink-0 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Finalizar compras
              </button>
            </div>
            </div>
            <div className="relative shrink-0 self-start">
              {mostrarDicaPainelFlutuante ? (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0.96, y: -1 }}
                  animate={{ opacity: [1, 0.9, 1], y: [0, -2, 0] }}
                  transition={{
                    duration: 1.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute -top-14 right-0 z-[50] w-[min(17.5rem,calc(100vw-2.5rem))] rounded-2xl border border-amber-300/95 bg-white px-3 py-1.5 text-left text-[11px] font-semibold leading-snug text-amber-900 shadow-md shadow-amber-200/60"
                >
                  {FRASE_DICA_PAINEL_FLUTUANTE}
                  <span className="absolute -bottom-2 left-[78%] h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-amber-300/95 bg-white" />
                  <span className="absolute -bottom-3 left-[76%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-amber-200" />
                  <span className="absolute -bottom-5 left-[74%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-amber-200" />
                </motion.div>
              ) : null}
              {mostrarDicaPainelFlutuante ? (
                <motion.button
                  type="button"
                  onClick={aoMinimizarResumoMercado}
                  className="relative z-[1] flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation items-center justify-center rounded-xl border border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/40"
                  aria-label="Minimizar para painel flutuante"
                  title="Painel flutuante"
                  animate={{
                    scale: [1, 1.04, 1],
                    opacity: [1, 0.86, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(251, 146, 60, 0.72)",
                      "0 0 0 12px rgba(251, 146, 60, 0)",
                      "0 0 0 0 rgba(251, 146, 60, 0.72)",
                    ],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 shrink-0 text-white"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                  <span className="sr-only"> — destaque: painel flutuante</span>
                </motion.button>
              ) : (
                <button
                  type="button"
                  onClick={aoMinimizarResumoMercado}
                  className="relative z-20 flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-xl border border-blue-200/80 bg-white/95 text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-95"
                  aria-label="Minimizar para painel flutuante"
                  title="Painel flutuante"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 shrink-0"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {orcamentoAtivo ? (
            <div className="mt-3 border-t border-blue-200/70 pt-3">
              {!painelOrcamentoVisivel ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {statusOrcamento ? (
                      <>
                        <div
                          className="h-2 overflow-hidden rounded-full bg-slate-200/90"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(
                            statusOrcamento.larguraBarraPct,
                          )}
                          aria-label="Percentual do orçamento usado pelo total estimado"
                        >
                          <div
                            className={[
                              "h-full rounded-full transition-[width] duration-300 ease-out",
                              statusOrcamento.barraClass,
                            ].join(" ")}
                            style={{
                              width: `${statusOrcamento.larguraBarraPct}%`,
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                          <span className="tabular-nums text-slate-700">
                            {formatarMoedaBRL(totalPrecos)} de{" "}
                            {formatarMoedaBRL(orcamentoReais ?? 0)}
                          </span>
                          <span className="tabular-nums font-medium text-slate-600">
                            {(statusOrcamento.r * 100).toFixed(0)}% do
                            orçamento
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-slate-700">
                        Orçamento desta ida (R$)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPainelOrcamentoVisivel((v) => !v)
                    }
                    aria-expanded={false}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-blue-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50/90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Mostrar
                  </button>
                </div>
              ) : null}
              {painelOrcamentoVisivel ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Orçamento desta ida (R$)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPainelOrcamentoVisivel((v) => !v)
                      }
                      aria-expanded
                      className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-blue-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50/90"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                      Ocultar
                    </button>
                  </div>
                    <div className="mt-2 flex w-full flex-col gap-2">
                    <label htmlFor="orcamento-mercado" className="sr-only">
                      Valor do orçamento em reais
                    </label>
                    {mostrarDestaqueOrcamentoCampo ? (
                      <motion.div
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0.96, y: -1 }}
                        animate={{ opacity: [1, 0.9, 1], y: [0, -2, 0] }}
                        transition={{
                          duration: 1.35,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="pointer-events-none relative z-[50] mb-1 mr-auto w-fit max-w-[min(20rem,calc(100vw-2rem))] self-start rounded-2xl border border-orange-300/95 bg-white px-3 py-1.5 text-left text-[11px] font-semibold leading-snug text-orange-900 shadow-md shadow-orange-200/60"
                      >
                        <span className="text-orange-950">
                          {FRASE_DICA_ORCAMENTO.slice(0, charsFraseOrc)}
                          {charsFraseOrc < FRASE_DICA_ORCAMENTO.length ? (
                            <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-px animate-pulse rounded-sm bg-orange-500 align-middle" />
                          ) : null}
                        </span>
                        <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-orange-300/95 bg-white" />
                        <span className="absolute -bottom-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-orange-200" />
                        <span className="absolute -bottom-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-orange-200" />
                      </motion.div>
                    ) : null}
                    <div className="flex flex-1 flex-wrap items-center gap-2 sm:min-w-[12rem]">
                      <div
                        className={[
                          "relative min-w-[7rem] flex-1 rounded-xl border-2 bg-white/95 sm:max-w-[14rem]",
                          mostrarDestaqueOrcamentoCampo
                            ? "animate-orcamento-campo-pulsar border-orange-500"
                            : "border-blue-200/90",
                        ].join(" ")}
                      >
                        <input
                          id="orcamento-mercado"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="R$ 100,00"
                          value={
                            orcamentoCampoRascunho !== null
                              ? orcamentoCampoRascunho
                              : orcamentoReais != null
                                ? formatarMoedaBRL(orcamentoReais)
                                : ""
                          }
                          onFocus={() => {
                            setOrcamentoCampoRascunho(
                              orcamentoReais != null
                                ? formatarMoedaBRL(orcamentoReais)
                                : "",
                            );
                          }}
                          onBlur={() => {
                            const rasc = orcamentoCampoRascunho;
                            setOrcamentoCampoRascunho(null);
                            if (!onOrcamentoChange) return;

                            const eraTutorial =
                              orcamentoAtivo &&
                              !dicaOrcamentoListaCompletaVista;
                            if (eraTutorial) {
                              marcarDicaOrcamentoListaCompletaVista();
                              setDicaOrcamentoListaCompletaVista(true);
                            }

                            if (rasc == null) return;
                            const t = rasc.trim();
                            if (t === "") {
                              onOrcamentoChange(null);
                              return;
                            }
                            const n = parsearEntradaMoeda(rasc);
                            if (n !== null) onOrcamentoChange(n);
                          }}
                          onChange={(e) => {
                            if (!onOrcamentoChange) return;
                            const v = e.target.value;
                            setOrcamentoCampoRascunho(v);

                            if (emTutorialOrcamento) {
                              if (v.trim() === "") {
                                onOrcamentoChange(null);
                              }
                              return;
                            }

                            if (v.trim() === "") {
                              onOrcamentoChange(null);
                              return;
                            }
                            const n = parsearEntradaMoeda(v);
                            if (n !== null) {
                              onOrcamentoChange(n);
                            }
                          }}
                          className="relative z-[2] min-h-[44px] w-full rounded-[10px] border-0 bg-transparent px-3 py-2 text-base font-medium tabular-nums text-slate-900 shadow-inner outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        onClick={() => {
                          setOrcamentoCampoRascunho(null);
                          onOrcamentoChange?.(null);
                          if (!dicaOrcamentoListaCompletaVista) {
                            marcarDicaOrcamentoListaCompletaVista();
                            setDicaOrcamentoListaCompletaVista(true);
                          }
                        }}
                      >
                        Limpar orçamento
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-snug text-slate-600">
                    Valores em reais (R$). O total estimado compara com este
                    limite na lista completa.
                  </p>
                  {statusOrcamento ? (
                    <div className="mt-3 space-y-2">
                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-slate-200/90"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(
                          statusOrcamento.larguraBarraPct,
                        )}
                        aria-label="Percentual do orçamento usado pelo total estimado"
                      >
                        <div
                          className={[
                            "h-full rounded-full transition-[width] duration-300 ease-out",
                            statusOrcamento.barraClass,
                          ].join(" ")}
                          style={{
                            width: `${statusOrcamento.larguraBarraPct}%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                        <span className="tabular-nums text-slate-700">
                          {formatarMoedaBRL(totalPrecos)} de{" "}
                          {formatarMoedaBRL(orcamentoReais ?? 0)}
                        </span>
                        <span className="tabular-nums font-medium text-slate-600">
                          {(statusOrcamento.r * 100).toFixed(0)}% do orçamento
                        </span>
                      </div>
                      {statusOrcamento.aviso ? (
                        <p
                          role="status"
                          className={[
                            "text-sm",
                            statusOrcamento.avisoClass,
                          ].join(" ")}
                        >
                          {statusOrcamento.aviso}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
          ) : null}
          {!resumoMercadoExpandido ? (
            <PainelFlutuanteResumoMercado
              listaSimples={listaSimples}
              totalPrecos={totalPrecos}
              statusOrcamento={statusOrcamento}
              temComprados={temComprados}
              onFinalizarClick={aoFinalizarComprasMercado}
              onExpandir={() => setResumoMercadoExpandido(true)}
            />
          ) : null}
        </>
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
                      destaqueTutorialPrecoQtd={
                        !listaSimples &&
                        !lerTutorialFlutuanteItensCompleto() &&
                        tutorialFlutuanteItemId === item.id &&
                        faseTutorialFlutuanteItens === "preco-qtd"
                      }
                      destaqueTutorialCheckbox={
                        !listaSimples &&
                        !lerTutorialFlutuanteItensCompleto() &&
                        tutorialFlutuanteItemId === item.id &&
                        faseTutorialFlutuanteItens === "checkbox" &&
                        !item.comprado
                      }
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
