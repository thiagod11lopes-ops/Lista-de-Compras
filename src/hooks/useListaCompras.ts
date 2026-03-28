import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompraFinalizada } from "../types/balanco";
import type { Categoria, ItemCompra, UnidadeLista } from "../types/item";
import { linhasTotaisComprados, somaTotaisLinhas } from "../utils/itemMercado";
import {
  carregarEstado,
  salvarEstado,
  type EstadoLista,
} from "../services/storage";
import {
  nomeItemJaExiste,
  tituloCategoriaJaExiste,
} from "../utils/duplicados";

export type ResultadoMutacaoLista =
  | { ok: true }
  | {
      ok: false;
      motivo: "item_duplicado" | "categoria_duplicada" | "invalido";
    };

function ordenarPorAdicao(itens: ItemCompra[]): ItemCompra[] {
  return [...itens].sort((a, b) => a.criadoEm - b.criadoEm);
}

export function useListaCompras() {
  /** Modo da visita atual à Lista do Mercado (afeta a próxima finalização). */
  const modoListaMercadoRef = useRef<"simples" | "completa">("completa");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [itens, setItens] = useState<ItemCompra[]>([]);
  const [comprasFinalizadas, setComprasFinalizadas] = useState<
    CompraFinalizada[]
  >([]);
  const [hidratar, setHidratar] = useState(true);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const estado = await carregarEstado();
      if (vivo) {
        setCategorias(estado.categorias);
        setItens(ordenarPorAdicao(estado.itens));
        setComprasFinalizadas(estado.comprasFinalizadas);
        setHidratar(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (hidratar) return;
    void salvarEstado({ categorias, itens, comprasFinalizadas });
  }, [categorias, itens, comprasFinalizadas, hidratar]);

  useEffect(() => {
    setCategorias((prev) =>
      prev.filter((c) => itens.some((i) => i.categoriaId === c.id)),
    );
  }, [itens]);

  /** Itens que ainda aparecem na Lista do Mercado (não finalizados dali). */
  const itensNaListaDoMercado = useMemo(
    () => itens.filter((i) => !i.excluidoDoMercado),
    [itens],
  );

  /**
   * Aba Comprar Novamente: comprados, enviados ao mercado a partir daqui (opacos),
   * ou retirados da Lista do Mercado pelo ícone (excluídos mas ainda não comprados).
   */
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
      if (novaTitulo) {
        const nova: Categoria = {
          id: crypto.randomUUID(),
          titulo: novaTitulo,
          criadoEm: Date.now(),
        };
        setCategorias((prev) => [...prev, nova]);
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
      setItens((prev) => ordenarPorAdicao([...prev, novo]));
      return { ok: true };
    },
    [itens, categorias],
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
      if (novaTitulo) {
        const nova: Categoria = {
          id: crypto.randomUUID(),
          titulo: novaTitulo,
          criadoEm: Date.now(),
        };
        setCategorias((prev) => [...prev, nova]);
        categoriaIdFinal = nova.id;
      } else if (op.categoriaIdExistente) {
        categoriaIdFinal = op.categoriaIdExistente;
      }

      setItens((prev) =>
        prev.map((i) => {
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
      );
      return { ok: true };
    },
    [itens, categorias],
  );

  const alternarComprado = useCallback((id: string) => {
    setItens((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const novo = !i.comprado;
        return {
          ...i,
          comprado: novo,
          ...(novo ? { retiradoParaMercadoNovamente: false } : {}),
        };
      }),
    );
  }, []);

  const restaurarItemNoMercado = useCallback((id: string) => {
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              comprado: false,
              preco: undefined,
              quantidade: undefined,
            }
          : i,
      ),
    );
  }, []);

  /**
   * Comprar Novamente: envia o item à Lista do Mercado (limpa campos) ou tira de lá.
   * O item permanece nesta aba; quando enviado, fica opaco (`retiradoParaMercadoNovamente`).
   */
  const alternarItemNaListaDoMercado = useCallback((id: string) => {
    setItens((prev) =>
      prev.map((i) => {
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
    );
  }, []);

  /** Retira o item da Lista do Mercado; permanece nas outras abas. */
  const retirarDaListaDoMercado = useCallback((id: string) => {
    setItens((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          excluidoDoMercado: true,
          preco: undefined,
          quantidade: undefined,
          retiradoParaMercadoNovamente: false,
        };
      }),
    );
  }, []);

  const definirPrecoItem = useCallback((id: string, preco: number | null) => {
    setItens((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (preco === null)
          return { ...i, preco: undefined };
        const arredondado = Math.round(preco * 100) / 100;
        return { ...i, preco: arredondado };
      }),
    );
  }, []);

  const definirQuantidadeItem = useCallback(
    (id: string, valor: number | null) => {
      setItens((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          if (valor === null || valor <= 0 || !Number.isFinite(valor))
            return { ...i, quantidade: undefined };
          const q = Math.round(valor * 1000) / 1000;
          return { ...i, quantidade: Math.max(0.001, q) };
        }),
      );
    },
    [],
  );

  const limparLista = useCallback(() => {
    setItens([]);
    setCategorias([]);
  }, []);

  /** Apaga itens, categorias e histórico do balanço (estado inicial). */
  const zerarSistema = useCallback(() => {
    const vazio: EstadoLista = {
      categorias: [],
      itens: [],
      comprasFinalizadas: [],
    };
    setItens([]);
    setCategorias([]);
    setComprasFinalizadas([]);
    void salvarEstado(vazio);
  }, []);

  const removerItensPorIds = useCallback((ids: Iterable<string>) => {
    const remover = new Set(ids);
    if (remover.size === 0) return;
    setItens((prev) => prev.filter((i) => !remover.has(i.id)));
  }, []);

  const definirModoListaMercado = useCallback((modo: "simples" | "completa") => {
    modoListaMercadoRef.current = modo;
  }, []);

  const finalizarCompras = useCallback(() => {
    const modo = modoListaMercadoRef.current;
    setItens((prev) => {
      const naMercado = prev.filter((i) => !i.excluidoDoMercado);

      if (modo === "simples") {
        const comprados = naMercado.filter((i) => i.comprado);
        if (comprados.length === 0) return prev;
        const registro: CompraFinalizada = {
          id: crypto.randomUUID(),
          finalizadaEm: Date.now(),
          itens: comprados.map((i) => ({ nome: i.nome, preco: null })),
          total: 0,
          tipoLista: "simples",
        };
        setComprasFinalizadas((cf) => [registro, ...cf]);
        return prev.map((i) =>
          !i.excluidoDoMercado && i.comprado
            ? { ...i, excluidoDoMercado: true }
            : i,
        );
      }

      const linhas = linhasTotaisComprados(naMercado);
      if (linhas.length === 0) return prev;

      const total = somaTotaisLinhas(linhas);
      const registro: CompraFinalizada = {
        id: crypto.randomUUID(),
        finalizadaEm: Date.now(),
        itens: linhas.map((l) => ({ nome: l.nome, preco: l.total })),
        total,
        tipoLista: "completa",
      };
      setComprasFinalizadas((cf) => [registro, ...cf]);

      return prev.map((i) =>
        !i.excluidoDoMercado && i.comprado
          ? { ...i, excluidoDoMercado: true }
          : i,
      );
    });
  }, []);

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
      setCategorias((prev) => [...prev, nova]);
      setItens((prev) =>
        prev.map((i) =>
          idSet.has(i.id) ? { ...i, categoriaId: nova.id } : i,
        ),
      );
      return { ok: true };
    },
    [categorias],
  );

  return {
    categorias,
    itens,
    itensNaListaDoMercado,
    comprasFinalizadas,
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
    criarCategoriaEAtribuirItens,
  };
}
