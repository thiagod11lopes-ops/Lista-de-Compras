import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompraFinalizada } from "../types/balanco";
import type { Categoria, ItemCompra, UnidadeLista } from "../types/item";
import type { ViagemLista } from "../types/viagem";
import { linhasTotaisComprados, somaTotaisLinhas } from "../utils/itemMercado";
import {
  carregarEstado,
  criarEstadoVazio,
  garantirEstadoValido,
  salvarEstado,
  type EstadoLista,
} from "../services/storage";
import {
  nomeItemJaExiste,
  tituloCategoriaJaExiste,
} from "../utils/duplicados";
import { nomeViagemJaExiste, normalizarNomeViagem } from "../utils/viagem";

export type ResultadoMutacaoLista =
  | { ok: true }
  | {
      ok: false;
      motivo: "item_duplicado" | "categoria_duplicada" | "invalido";
    };

export type ResultadoNovaViagem =
  | { ok: true }
  | { ok: false; motivo: "duplicado" | "invalido" };

function ordenarPorAdicao(itens: ItemCompra[]): ItemCompra[] {
  return [...itens].sort((a, b) => a.criadoEm - b.criadoEm);
}

const seedInicial = criarEstadoVazio();

export function useListaCompras() {
  const modoListaMercadoRef = useRef<"simples" | "completa">("completa");

  const [viagens, setViagens] = useState<ViagemLista[]>(
    () => seedInicial.viagens,
  );
  const [viagemAtivaId, setViagemAtivaId] = useState(
    () => seedInicial.viagemAtivaId,
  );
  const [hidratar, setHidratar] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const estado = garantirEstadoValido(await carregarEstado());
      if (vivo) {
        setViagens(estado.viagens);
        setViagemAtivaId(estado.viagemAtivaId);
        setHidratar(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const listaViagens = Array.isArray(viagens) ? viagens : [];

  const estadoLista = useMemo(
    (): EstadoLista => ({
      viagens: listaViagens,
      viagemAtivaId,
    }),
    [listaViagens, viagemAtivaId],
  );

  const viagemAtiva = useMemo(
    () => listaViagens.find((v) => v.id === viagemAtivaId),
    [listaViagens, viagemAtivaId],
  );

  const categorias = viagemAtiva?.categorias ?? [];
  const itens = viagemAtiva?.itens ?? [];
  const ordemCorredoresCategoriaIds =
    viagemAtiva?.ordemCorredoresCategoriaIds ?? [];

  const orcamentoReais = viagemAtiva?.orcamentoReais ?? null;

  useEffect(() => {
    if (hidratar) return;
    const estado: EstadoLista = { viagens, viagemAtivaId };
    void salvarEstado(estado);
  }, [viagens, viagemAtivaId, hidratar]);

  const patchViagemAtiva = useCallback(
    (fn: (v: ViagemLista) => ViagemLista) => {
      setViagens((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        return p.map((v) => (v.id === viagemAtivaId ? fn(v) : v));
      });
    },
    [viagemAtivaId],
  );

  useEffect(() => {
    if (hidratar || !viagemAtivaId) return;
    setViagens((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      return p.map((v) => {
        if (v.id !== viagemAtivaId) return v;
        const idsSet = new Set(v.categorias.map((c) => c.id));
        const base = v.ordemCorredoresCategoriaIds.filter((id) =>
          idsSet.has(id),
        );
        const inBase = new Set(base);
        const novas = v.categorias
          .filter((c) => !inBase.has(c.id))
          .sort((a, b) => a.criadoEm - b.criadoEm)
          .map((c) => c.id);
        return {
          ...v,
          ordemCorredoresCategoriaIds: [...base, ...novas],
        };
      });
    });
  }, [categorias, hidratar, viagemAtivaId]);

  useEffect(() => {
    if (hidratar || !viagemAtivaId) return;
    setViagens((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      return p.map((v) => {
        if (v.id !== viagemAtivaId) return v;
        return {
          ...v,
          categorias: v.categorias.filter((c) =>
            v.itens.some((i) => i.categoriaId === c.id),
          ),
        };
      });
    });
  }, [itens, hidratar, viagemAtivaId]);

  const itensNaListaDoMercado = useMemo(
    () => itens.filter((i) => !i.excluidoDoMercado),
    [itens],
  );

  const itensComprarNovamente = useMemo(
    () =>
      itens.filter(
        (i) =>
          i.comprado ||
          i.retiradoParaMercadoNovamente === true ||
          (i.excluidoDoMercado === true && !i.comprado),
      ),
    [itens],
  );

  const contagem = useMemo(() => {
    const comprados = itens.filter((i) => i.comprado).length;
    const faltando = itens.length - comprados;
    return { total: itens.length, comprados, faltando };
  }, [itens]);

  const comprasPorViagem = useMemo(
    () =>
      listaViagens.map((v) => ({
        viagemId: v.id,
        nomeViagem: v.nome,
        compras: v.comprasFinalizadas,
      })),
    [listaViagens],
  );

  /** Todas as finalizações (todas as listas) — sugestões ao escrever no histórico. */
  const historicoComprasFinalizadas = useMemo(
    () => listaViagens.flatMap((v) => v.comprasFinalizadas),
    [listaViagens],
  );

  const viagensResumo = useMemo(
    () => listaViagens.map((v) => ({ id: v.id, nome: v.nome })),
    [listaViagens],
  );

  const selecionarViagem = useCallback((id: string) => {
    setViagemAtivaId(id);
  }, []);

  const criarViagem = useCallback(
    (nome: string): ResultadoNovaViagem => {
      const t = normalizarNomeViagem(nome);
      if (!t) return { ok: false, motivo: "invalido" };
      if (nomeViagemJaExiste(listaViagens, t)) {
        return { ok: false, motivo: "duplicado" };
      }
      const id = crypto.randomUUID();
      const nova: ViagemLista = {
        id,
        nome: t,
        criadoEm: Date.now(),
        categorias: [],
        itens: [],
        ordemCorredoresCategoriaIds: [],
        comprasFinalizadas: [],
      };
      setViagens((prev) => [...(Array.isArray(prev) ? prev : []), nova]);
      setViagemAtivaId(id);
      return { ok: true };
    },
    [listaViagens],
  );

  const renomearViagem = useCallback(
    (id: string, nome: string): ResultadoNovaViagem => {
      const t = normalizarNomeViagem(nome);
      if (!t) return { ok: false, motivo: "invalido" };
      if (nomeViagemJaExiste(listaViagens, t, id)) {
        return { ok: false, motivo: "duplicado" };
      }
      setViagens((prev) => {
        const p = Array.isArray(prev) ? prev : [];
        return p.map((v) => (v.id === id ? { ...v, nome: t } : v));
      });
      return { ok: true };
    },
    [listaViagens],
  );

  const removerViagem = useCallback((id: string): boolean => {
    let ok = false;
    setViagens((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      if (p.length <= 1) return p;
      ok = true;
      return p.filter((v) => v.id !== id);
    });
    return ok;
  }, []);

  useEffect(() => {
    const v = Array.isArray(viagens) ? viagens : [];
    if (v.length === 0) return;
    if (!v.some((x) => x.id === viagemAtivaId)) {
      setViagemAtivaId(v[0].id);
    }
  }, [viagens, viagemAtivaId]);

  const adicionarItemComCategoria = useCallback(
    (
      nome: string,
      op: {
        categoriaIdExistente: string | null;
        novaCategoriaTitulo: string | null;
        unidadeLista: UnidadeLista;
      },
    ): ResultadoMutacaoLista => {
      const t = nome.trim();
      if (!t) return { ok: false, motivo: "invalido" };

      if (nomeItemJaExiste(itens, t)) {
        return { ok: false, motivo: "item_duplicado" };
      }

      const novaTitulo = op.novaCategoriaTitulo?.trim();
      if (novaTitulo && tituloCategoriaJaExiste(categorias, novaTitulo)) {
        return { ok: false, motivo: "categoria_duplicada" };
      }

      let categoriaIdFinal: string | undefined;
      let categoriasNext = categorias;
      if (novaTitulo) {
        const nova: Categoria = {
          id: crypto.randomUUID(),
          titulo: novaTitulo,
          criadoEm: Date.now(),
        };
        categoriasNext = [...categorias, nova];
        categoriaIdFinal = nova.id;
      } else if (op.categoriaIdExistente) {
        categoriaIdFinal = op.categoriaIdExistente;
      }

      const novo: ItemCompra = {
        id: crypto.randomUUID(),
        nome: t,
        comprado: false,
        criadoEm: Date.now(),
        unidadeLista: op.unidadeLista ?? "un",
        ...(categoriaIdFinal ? { categoriaId: categoriaIdFinal } : {}),
      };

      patchViagemAtiva((v) => ({
        ...v,
        categorias: categoriasNext,
        itens: ordenarPorAdicao([...v.itens, novo]),
      }));
      return { ok: true };
    },
    [itens, categorias, patchViagemAtiva],
  );

  const atualizarItem = useCallback(
    (
      id: string,
      op: {
        nome: string;
        categoriaIdExistente: string | null;
        novaCategoriaTitulo: string | null;
        unidadeLista: UnidadeLista;
      },
    ): ResultadoMutacaoLista => {
      const t = op.nome.trim();
      if (!t) return { ok: false, motivo: "invalido" };

      if (nomeItemJaExiste(itens, t, id)) {
        return { ok: false, motivo: "item_duplicado" };
      }

      const novaTitulo = op.novaCategoriaTitulo?.trim();
      if (novaTitulo && tituloCategoriaJaExiste(categorias, novaTitulo)) {
        return { ok: false, motivo: "categoria_duplicada" };
      }

      let categoriaIdFinal: string | undefined;
      let categoriasNext = categorias;
      if (novaTitulo) {
        const nova: Categoria = {
          id: crypto.randomUUID(),
          titulo: novaTitulo,
          criadoEm: Date.now(),
        };
        categoriasNext = [...categorias, nova];
        categoriaIdFinal = nova.id;
      } else if (op.categoriaIdExistente) {
        categoriaIdFinal = op.categoriaIdExistente;
      }

      patchViagemAtiva((v) => ({
        ...v,
        categorias: categoriasNext,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          const base: ItemCompra = {
            ...i,
            nome: t,
            unidadeLista: op.unidadeLista ?? "un",
          };
          if (categoriaIdFinal) {
            return { ...base, categoriaId: categoriaIdFinal };
          }
          return { ...base, categoriaId: undefined };
        }),
      }));
      return { ok: true };
    },
    [itens, categorias, patchViagemAtiva],
  );

  const alternarComprado = useCallback(
    (id: string) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          const novo = !i.comprado;
          return {
            ...i,
            comprado: novo,
            ...(novo ? { retiradoParaMercadoNovamente: false } : {}),
          };
        }),
      }));
    },
    [patchViagemAtiva],
  );

  const restaurarItemNoMercado = useCallback(
    (id: string) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) =>
          i.id === id
            ? {
                ...i,
                comprado: false,
                preco: undefined,
                quantidade: undefined,
              }
            : i,
        ),
      }));
    },
    [patchViagemAtiva],
  );

  const alternarItemNaListaDoMercado = useCallback(
    (id: string) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          if (i.retiradoParaMercadoNovamente === true) {
            return {
              ...i,
              retiradoParaMercadoNovamente: false,
              excluidoDoMercado: true,
              comprado: true,
              preco: undefined,
              quantidade: undefined,
            };
          }
          return {
            ...i,
            retiradoParaMercadoNovamente: true,
            comprado: false,
            preco: undefined,
            quantidade: undefined,
            excluidoDoMercado: false,
          };
        }),
      }));
    },
    [patchViagemAtiva],
  );

  const retirarDaListaDoMercado = useCallback(
    (id: string) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            excluidoDoMercado: true,
            preco: undefined,
            quantidade: undefined,
            retiradoParaMercadoNovamente: false,
          };
        }),
      }));
    },
    [patchViagemAtiva],
  );

  const definirPrecoItem = useCallback(
    (id: string, preco: number | null) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          if (preco === null) return { ...i, preco: undefined };
          const arredondado = Math.round(preco * 100) / 100;
          return { ...i, preco: arredondado };
        }),
      }));
    },
    [patchViagemAtiva],
  );

  const definirQuantidadeItem = useCallback(
    (id: string, valor: number | null) => {
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.map((i) => {
          if (i.id !== id) return i;
          if (valor === null || valor <= 0 || !Number.isFinite(valor))
            return { ...i, quantidade: undefined };
          const q = Math.round(valor * 1000) / 1000;
          return { ...i, quantidade: Math.max(0.001, q) };
        }),
      }));
    },
    [patchViagemAtiva],
  );

  const limparLista = useCallback(() => {
    patchViagemAtiva((v) => ({
      ...v,
      itens: [],
      categorias: [],
    }));
  }, [patchViagemAtiva]);

  const definirOrdemCorredoresCategoriaIds = useCallback(
    (ids: string[]) => {
      patchViagemAtiva((v) => ({
        ...v,
        ordemCorredoresCategoriaIds: ids,
      }));
    },
    [patchViagemAtiva],
  );

  const definirOrcamentoReais = useCallback(
    (valor: number | null) => {
      patchViagemAtiva((v) => ({
        ...v,
        orcamentoReais: valor,
      }));
    },
    [patchViagemAtiva],
  );

  const zerarSistema = useCallback(() => {
    const vazio = criarEstadoVazio();
    setViagens(vazio.viagens);
    setViagemAtivaId(vazio.viagemAtivaId);
    void salvarEstado(vazio);
  }, []);

  /** Substitui todo o estado (ex.: sincronização em tempo real da nuvem). */
  const substituirEstadoCompleto = useCallback((novo: EstadoLista) => {
    const g = garantirEstadoValido(novo);
    setViagens(g.viagens);
    setViagemAtivaId(g.viagemAtivaId);
  }, []);

  const removerItensPorIds = useCallback(
    (ids: Iterable<string>) => {
      const remover = new Set(ids);
      if (remover.size === 0) return;
      patchViagemAtiva((v) => ({
        ...v,
        itens: v.itens.filter((i) => !remover.has(i.id)),
      }));
    },
    [patchViagemAtiva],
  );

  const definirModoListaMercado = useCallback((modo: "simples" | "completa") => {
    modoListaMercadoRef.current = modo;
  }, []);

  const finalizarCompras = useCallback(() => {
    const modo = modoListaMercadoRef.current;
    patchViagemAtiva((v) => {
      const naMercado = v.itens.filter((i) => !i.excluidoDoMercado);

      if (modo === "simples") {
        const comprados = naMercado.filter((i) => i.comprado);
        if (comprados.length === 0) return v;
        const registro: CompraFinalizada = {
          id: crypto.randomUUID(),
          finalizadaEm: Date.now(),
          itens: comprados.map((i) => ({ nome: i.nome, preco: null })),
          total: 0,
          tipoLista: "simples",
        };
        return {
          ...v,
          comprasFinalizadas: [registro, ...v.comprasFinalizadas],
          itens: v.itens.map((i) =>
            !i.excluidoDoMercado && i.comprado
              ? { ...i, excluidoDoMercado: true }
              : i,
          ),
        };
      }

      const linhas = linhasTotaisComprados(naMercado);
      if (linhas.length === 0) return v;

      const total = somaTotaisLinhas(linhas);
      const registro: CompraFinalizada = {
        id: crypto.randomUUID(),
        finalizadaEm: Date.now(),
        itens: linhas.map((l) => ({ nome: l.nome, preco: l.total })),
        total,
        tipoLista: "completa",
      };

      return {
        ...v,
        comprasFinalizadas: [registro, ...v.comprasFinalizadas],
        itens: v.itens.map((i) =>
          !i.excluidoDoMercado && i.comprado
            ? { ...i, excluidoDoMercado: true }
            : i,
        ),
      };
    });
  }, [patchViagemAtiva]);

  const criarCategoriaEAtribuirItens = useCallback(
    (titulo: string, idsDosItens: string[]): ResultadoMutacaoLista => {
      const t = titulo.trim();
      const idSet = new Set(idsDosItens);
      if (!t || idSet.size === 0) return { ok: false, motivo: "invalido" };

      if (tituloCategoriaJaExiste(categorias, t)) {
        return { ok: false, motivo: "categoria_duplicada" };
      }

      const nova: Categoria = {
        id: crypto.randomUUID(),
        titulo: t,
        criadoEm: Date.now(),
      };
      patchViagemAtiva((v) => ({
        ...v,
        categorias: [...v.categorias, nova],
        itens: v.itens.map((i) =>
          idSet.has(i.id) ? { ...i, categoriaId: nova.id } : i,
        ),
      }));
      return { ok: true };
    },
    [categorias, patchViagemAtiva],
  );

  return {
    estadoLista,
    categorias,
    itens,
    itensNaListaDoMercado,
    comprasPorViagem,
    historicoComprasFinalizadas,
    viagensResumo,
    viagemAtivaId,
    ordemCorredoresCategoriaIds,
    orcamentoReais,
    definirOrcamentoReais,
    itensComprarNovamente,
    contagem,
    hidratar,
    adicionarItemComCategoria,
    atualizarItem,
    alternarComprado,
    alternarItemNaListaDoMercado,
    retirarDaListaDoMercado,
    restaurarItemNoMercado,
    definirPrecoItem,
    definirQuantidadeItem,
    limparLista,
    zerarSistema,
    removerItensPorIds,
    finalizarCompras,
    definirModoListaMercado,
    definirOrdemCorredoresCategoriaIds,
    criarCategoriaEAtribuirItens,
    selecionarViagem,
    criarViagem,
    renomearViagem,
    removerViagem,
    substituirEstadoCompleto,
  };
}
