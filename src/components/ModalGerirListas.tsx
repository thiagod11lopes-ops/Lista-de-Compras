import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { ResultadoNovaViagem } from "../hooks/useListaCompras";

type ViagemResumo = { id: string; nome: string };

type Props = {
  aberto: boolean;
  onFechar: () => void;
  viagens: ViagemResumo[];
  viagemAtivaId: string;
  onCriar: (nome: string) => ResultadoNovaViagem;
  onRenomear: (id: string, nome: string) => ResultadoNovaViagem;
  onRemover: (id: string) => boolean;
  disabled?: boolean;
};

export function ModalGerirListas({
  aberto,
  onFechar,
  viagens,
  viagemAtivaId,
  onCriar,
  onRenomear,
  onRemover,
  disabled = false,
}: Props) {
  const tituloId = useId();
  const [novoNome, setNovoNome] = useState("");
  const [erroCriar, setErroCriar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [erroEdit, setErroEdit] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) {
      setNovoNome("");
      setErroCriar(null);
      setEditandoId(null);
      setEditNome("");
      setErroEdit(null);
    }
  }, [aberto]);

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

  function handleCriar() {
    setErroCriar(null);
    const r = onCriar(novoNome);
    if (r.ok) {
      setNovoNome("");
      onFechar();
    } else if (r.motivo === "duplicado") {
      setErroCriar("Já existe uma lista com esse nome.");
    } else {
      setErroCriar("Digite um nome para a lista.");
    }
  }

  function guardarRename() {
    if (!editandoId) return;
    setErroEdit(null);
    const r = onRenomear(editandoId, editNome);
    if (r.ok) {
      setEditandoId(null);
      setEditNome("");
    } else if (r.motivo === "duplicado") {
      setErroEdit("Já existe uma lista com esse nome.");
    } else {
      setErroEdit("Nome inválido.");
    }
  }

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
          className="fixed inset-0 z-[56] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            className="relative z-10 flex max-h-[min(85dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 pb-3 pt-5">
              <h2 id={tituloId} className="text-lg font-bold text-blue-950">
                Listas por viagem
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Cada lista tem os seus itens, categorias e histórico no balanço
                (ex.: loja habitual, feira).
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              <ul className="space-y-2">
                {viagens.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
                  >
                    {editandoId === v.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          className="w-full rounded-lg border border-blue-200 px-2 py-2 text-sm"
                          autoFocus
                        />
                        {erroEdit ? (
                          <p className="text-xs text-red-600">{erroEdit}</p>
                        ) : null}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={guardarRename}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditandoId(null);
                              setErroEdit(null);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {v.nome}
                          </p>
                          {v.id === viagemAtivaId ? (
                            <p className="text-[11px] font-medium text-blue-600">
                              Ativa
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setEditandoId(v.id);
                              setEditNome(v.nome);
                              setErroEdit(null);
                            }}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50"
                          >
                            Renomear
                          </button>
                          <button
                            type="button"
                            disabled={disabled || viagens.length <= 1}
                            onClick={() => {
                              if (
                                viagens.length <= 1 ||
                                !window.confirm(
                                  `Eliminar a lista "${v.nome}"? Os itens e o histórico desta lista na app serão perdidos.`,
                                )
                              ) {
                                return;
                              }
                              const ok = onRemover(v.id);
                              if (!ok) return;
                            }}
                            className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-700">Nova lista</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={novoNome}
                    disabled={disabled}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex.: Feira, Hipermercado"
                    className="min-h-[44px] flex-1 rounded-xl border-2 border-blue-100 px-3 text-sm outline-none focus:border-blue-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={handleCriar}
                    className="min-h-[44px] shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 text-sm font-semibold text-white shadow-md disabled:opacity-50"
                  >
                    Criar
                  </button>
                </div>
                {erroCriar ? (
                  <p className="mt-1 text-xs text-red-600">{erroCriar}</p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <button
                type="button"
                onClick={onFechar}
                className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white py-3 text-base font-semibold text-slate-800"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
