import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import type { Categoria, UnidadeLista } from "../types/item";

const TEXTO_PLACEHOLDER_NOVA_CATEGORIA =
  "Adicione um nome a categoria para esse item";

export type EscolhaCategoria = {
  categoriaIdExistente: string | null;
  novaCategoriaTitulo: string | null;
  unidadeLista: UnidadeLista;
  /** Modo edição: nome atualizado do item */
  nomeItemEditado?: string;
};

type Props = {
  aberto: boolean;
  nomeItem: string;
  categorias: Categoria[];
  onFechar: () => void;
  /** Devolva `false` para manter o modal aberto (ex.: nome ou categoria duplicados). */
  onConfirmar: (escolha: EscolhaCategoria) => boolean | void;
  modoEdicao?: boolean;
  /** Guias visuais laranja (tipo de medida, nova categoria, botão) — desligar quando já há itens e lista nomeada. */
  tutorialLaranjaAtivo?: boolean;
  valorInicialEdicao?: {
    nome: string;
    categoriaId: string | null;
    unidadeLista: UnidadeLista;
  };
};

export function ModalCategoriaNovoItem({
  aberto,
  nomeItem,
  categorias,
  onFechar,
  onConfirmar,
  modoEdicao = false,
  tutorialLaranjaAtivo = true,
  valorInicialEdicao,
}: Props) {
  const tituloId = useId();
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [unidadeLista, setUnidadeLista] = useState<UnidadeLista>("un");
  const [nomeEditavel, setNomeEditavel] = useState("");
  /** Só após clicar em UN ou Kg (fluxo novo item). */
  const [usuarioEscolheuTipoMedida, setUsuarioEscolheuTipoMedida] =
    useState(false);
  const [placeholderDigitadoNovaCat, setPlaceholderDigitadoNovaCat] =
    useState("");
  const [animacaoPlaceholderNovaCatAtiva, setAnimacaoPlaceholderNovaCatAtiva] =
    useState(true);
  const timeoutPlaceholderNovaCatRef = useRef<number | null>(null);

  const vi = valorInicialEdicao;
  useEffect(() => {
    if (!aberto) return;
    if (modoEdicao && vi) {
      setNomeEditavel(vi.nome);
      setCategoriaId(vi.categoriaId ?? "");
      setNovaCategoria("");
      setUnidadeLista(vi.unidadeLista);
      setUsuarioEscolheuTipoMedida(true);
    } else if (!modoEdicao) {
      setNomeEditavel("");
      setCategoriaId("");
      setNovaCategoria("");
      setUnidadeLista("un");
      setUsuarioEscolheuTipoMedida(false);
      setPlaceholderDigitadoNovaCat("");
      setAnimacaoPlaceholderNovaCatAtiva(true);
    }
  }, [aberto, modoEdicao, vi?.nome, vi?.categoriaId, vi?.unidadeLista]);

  useEffect(() => {
    if (usuarioEscolheuTipoMedida && !modoEdicao) {
      setPlaceholderDigitadoNovaCat("");
      setAnimacaoPlaceholderNovaCatAtiva(true);
    }
  }, [usuarioEscolheuTipoMedida, modoEdicao]);

  const destacarTipoQuantidade =
    tutorialLaranjaAtivo && !modoEdicao && !usuarioEscolheuTipoMedida;
  const destacarNovaCategoria =
    tutorialLaranjaAtivo &&
    !modoEdicao &&
    usuarioEscolheuTipoMedida &&
    !novaCategoria.trim() &&
    !categoriaId;

  useEffect(() => {
    if (destacarNovaCategoria) setAnimacaoPlaceholderNovaCatAtiva(true);
  }, [destacarNovaCategoria]);

  useEffect(() => {
    if (!destacarNovaCategoria || !animacaoPlaceholderNovaCatAtiva) {
      if (timeoutPlaceholderNovaCatRef.current != null) {
        window.clearTimeout(timeoutPlaceholderNovaCatRef.current);
        timeoutPlaceholderNovaCatRef.current = null;
      }
      return;
    }
    let i = 0;
    const limpar = () => {
      if (timeoutPlaceholderNovaCatRef.current != null) {
        window.clearTimeout(timeoutPlaceholderNovaCatRef.current);
        timeoutPlaceholderNovaCatRef.current = null;
      }
    };
    const tick = () => {
      if (!animacaoPlaceholderNovaCatAtiva || !destacarNovaCategoria) return;
      if (i <= TEXTO_PLACEHOLDER_NOVA_CATEGORIA.length) {
        setPlaceholderDigitadoNovaCat(
          TEXTO_PLACEHOLDER_NOVA_CATEGORIA.slice(0, i),
        );
        i += 1;
        timeoutPlaceholderNovaCatRef.current = window.setTimeout(tick, 75);
        return;
      }
      timeoutPlaceholderNovaCatRef.current = window.setTimeout(() => {
        setPlaceholderDigitadoNovaCat("");
        i = 0;
        tick();
      }, 1200);
    };
    tick();
    return limpar;
  }, [destacarNovaCategoria, animacaoPlaceholderNovaCatAtiva]);

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

  const categoriasOrdenadas = [...categorias].sort(
    (a, b) => a.criadoEm - b.criadoEm,
  );

  const digitandoNovaCategoria = novaCategoria.trim().length > 0;
  const botaoConfirmarEmRealceLaranja =
    tutorialLaranjaAtivo && digitandoNovaCategoria;

  function confirmar() {
    const nova = novaCategoria.trim();
    if (modoEdicao) {
      const nome = nomeEditavel.trim();
      if (!nome) return;
      const ok = nova
        ? onConfirmar({
            nomeItemEditado: nome,
            categoriaIdExistente: null,
            novaCategoriaTitulo: nova,
            unidadeLista,
          })
        : onConfirmar({
            nomeItemEditado: nome,
            categoriaIdExistente: categoriaId || null,
            novaCategoriaTitulo: null,
            unidadeLista,
          });
      if (ok !== false) onFechar();
      return;
    }
    const ok = nova
      ? onConfirmar({
          categoriaIdExistente: null,
          novaCategoriaTitulo: nova,
          unidadeLista,
        })
      : onConfirmar({
          categoriaIdExistente: categoriaId || null,
          novaCategoriaTitulo: null,
          unidadeLista,
        });
    if (ok !== false) onFechar();
  }

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
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
            className="relative z-10 flex max-h-[min(88dvh,600px)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-blue-950"
              >
                {modoEdicao ? "Editar item" : "Adicionar à categoria"}
              </h2>
              {modoEdicao ? (
                <label className="mt-0.5 block" htmlFor="nome-item-editar">
                  <span className="sr-only">Nome do item</span>
                  <input
                    id="nome-item-editar"
                    type="text"
                    value={nomeEditavel}
                    onChange={(e) => setNomeEditavel(e.target.value)}
                    placeholder="Nome do item"
                    className="mt-2 min-h-[48px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-base font-medium text-blue-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ) : (
                <p className="mt-2 rounded-xl bg-blue-50/80 px-3 py-2 text-sm font-medium text-blue-950">
                  {nomeItem}
                </p>
              )}
              <p className="mt-2 text-sm text-slate-600">
                Defina como a quantidade será informada no mercado e, em seguida,
                a categoria.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <fieldset
                className={[
                  "relative space-y-2",
                  destacarTipoQuantidade ? "pt-14" : "pt-1",
                ].join(" ")}
              >
                {destacarTipoQuantidade ? (
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
                    className="pointer-events-none absolute left-1/2 top-0 z-20 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-orange-300/95 bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-orange-900 shadow-md shadow-orange-200/60"
                  >
                    Escolha o tipo de medida
                    <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-orange-300/95 bg-white" />
                    <span className="absolute -bottom-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-orange-200" />
                    <span className="absolute -bottom-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-orange-200" />
                  </motion.div>
                ) : null}
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de quantidade
                </legend>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Tipo de quantidade na lista do mercado"
                >
                  <motion.button
                    type="button"
                    role="radio"
                    aria-checked={unidadeLista === "un"}
                    onClick={() => {
                      setUnidadeLista("un");
                      setUsuarioEscolheuTipoMedida(true);
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      destacarTipoQuantidade
                        ? {
                            scale: [1, 1.04, 1],
                            opacity: [1, 0.86, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(251, 146, 60, 0.72)",
                              "0 0 0 12px rgba(251, 146, 60, 0)",
                              "0 0 0 0 rgba(251, 146, 60, 0.72)",
                            ],
                          }
                        : undefined
                    }
                    transition={
                      destacarTipoQuantidade
                        ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : undefined
                    }
                    className={[
                      "flex flex-col gap-1 rounded-2xl border-2 px-3 py-3 text-left transition",
                      destacarTipoQuantidade
                        ? "border-orange-400 bg-gradient-to-br from-amber-50 to-orange-50/90 text-slate-800"
                        : unidadeLista === "un"
                          ? "border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-200"
                          : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={
                        destacarTipoQuantidade
                          ? "text-sm font-bold text-orange-950"
                          : "text-sm font-bold text-blue-950"
                      }
                    >
                      UN
                    </span>
                    <span className="text-[11px] leading-snug text-slate-600">
                      Unidade — quantidade em números inteiros (ex.: 2 caixas).
                    </span>
                  </motion.button>
                  <motion.button
                    type="button"
                    role="radio"
                    aria-checked={unidadeLista === "kg"}
                    onClick={() => {
                      setUnidadeLista("kg");
                      setUsuarioEscolheuTipoMedida(true);
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      destacarTipoQuantidade
                        ? {
                            scale: [1, 1.04, 1],
                            opacity: [1, 0.86, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(251, 146, 60, 0.72)",
                              "0 0 0 12px rgba(251, 146, 60, 0)",
                              "0 0 0 0 rgba(251, 146, 60, 0.72)",
                            ],
                          }
                        : undefined
                    }
                    transition={
                      destacarTipoQuantidade
                        ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : undefined
                    }
                    className={[
                      "flex flex-col gap-1 rounded-2xl border-2 px-3 py-3 text-left transition",
                      destacarTipoQuantidade
                        ? "border-orange-400 bg-gradient-to-br from-amber-50 to-orange-50/90 text-slate-800"
                        : unidadeLista === "kg"
                          ? "border-amber-500 bg-amber-50/90 shadow-sm ring-1 ring-amber-200"
                          : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span
                      className={
                        destacarTipoQuantidade
                          ? "text-sm font-bold text-orange-950"
                          : "text-sm font-bold text-amber-950"
                      }
                    >
                      Kg
                    </span>
                    <span className="text-[11px] leading-snug text-slate-600">
                      Quilos — peso estimado (ex.: 1,5 kg de tomate).
                    </span>
                  </motion.button>
                </div>
              </fieldset>

              <div className="space-y-2">
                <label
                  htmlFor="select-categoria-item"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Categoria existente
                </label>
                <select
                  id="select-categoria-item"
                  value={categoriaId}
                  disabled={novaCategoria.trim().length > 0}
                  onChange={(e) => {
                    setCategoriaId(e.target.value);
                  }}
                  className="min-h-[48px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sem categoria</option>
                  {categoriasOrdenadas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="nova-categoria-item"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Ou nova categoria
                </label>
                <motion.div
                  className="rounded-xl"
                  animate={
                    destacarNovaCategoria
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(251, 146, 60, 0.55)",
                            "0 0 0 10px rgba(251, 146, 60, 0)",
                            "0 0 0 0 rgba(251, 146, 60, 0.55)",
                          ],
                        }
                      : undefined
                  }
                  transition={
                    destacarNovaCategoria
                      ? {
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : undefined
                  }
                >
                  <input
                    id="nova-categoria-item"
                    type="text"
                    value={novaCategoria}
                    placeholder={
                      destacarNovaCategoria && animacaoPlaceholderNovaCatAtiva
                        ? placeholderDigitadoNovaCat
                        : "Ex.: Frutas e verduras"
                    }
                    onChange={(e) => {
                      setNovaCategoria(e.target.value);
                      if (e.target.value.trim()) setCategoriaId("");
                    }}
                    onFocus={() => setAnimacaoPlaceholderNovaCatAtiva(false)}
                    onBlur={() => {
                      if (
                        !modoEdicao &&
                        usuarioEscolheuTipoMedida &&
                        !novaCategoria.trim() &&
                        !categoriaId
                      ) {
                        setAnimacaoPlaceholderNovaCatAtiva(true);
                      }
                    }}
                    className={[
                      "min-h-[48px] w-full rounded-xl border-2 bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400",
                      destacarNovaCategoria
                        ? "border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
                    ].join(" ")}
                  />
                </motion.div>
                {novaCategoria.trim() ? (
                  <p className="text-xs text-slate-500">
                    O nome acima será usado como nova categoria (prioridade sobre
                    a lista).
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <button
                type="button"
                onClick={onFechar}
                className="min-h-[48px] flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
              >
                Cancelar
              </button>
              <motion.button
                type="button"
                onClick={confirmar}
                whileTap={{ scale: 0.98 }}
                animate={
                  botaoConfirmarEmRealceLaranja
                    ? {
                        scale: [1, 1.04, 1],
                        opacity: [1, 0.86, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(251, 146, 60, 0.72)",
                          "0 0 0 12px rgba(251, 146, 60, 0)",
                          "0 0 0 0 rgba(251, 146, 60, 0.72)",
                        ],
                      }
                    : undefined
                }
                transition={
                  botaoConfirmarEmRealceLaranja
                    ? {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : undefined
                }
                className={[
                  "min-h-[48px] flex-1 rounded-2xl py-3 text-base font-semibold text-white shadow-md transition",
                  botaoConfirmarEmRealceLaranja
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/30 hover:from-orange-700 hover:to-orange-600"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:from-blue-700 hover:to-blue-600",
                ].join(" ")}
              >
                {modoEdicao ? "Salvar" : "Adicionar"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
