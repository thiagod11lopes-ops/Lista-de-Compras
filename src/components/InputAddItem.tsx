import { motion } from "framer-motion";
import { type FormEvent, useId, useMemo, useState } from "react";
import type { CompraFinalizada } from "../types/balanco";
import type { ItemCompra } from "../types/item";
import { normalizarParaComparacao } from "../utils/duplicados";
import {
  construirIndiceHistorico,
  obterSugestoesHistorico,
} from "../utils/sugestoesHistorico";

type Props = {
  /** Chamado com o nome válido; o pai abre o modal de categoria. Devolva `false` para não limpar o campo (ex.: item duplicado). */
  onPedirCategoria: (nome: string) => boolean | void;
  /** Abre o leitor de código de barras (câmara). */
  onEscanear?: () => void;
  /** Finalizações de todas as listas — base para sugestões por histórico. */
  historicoCompras?: CompraFinalizada[];
  /** Itens da lista ativa (para não sugerir duplicados). */
  itensAtuais?: ItemCompra[];
  disabled?: boolean;
};

export function InputAddItem({
  onPedirCategoria,
  onEscanear,
  historicoCompras = [],
  itensAtuais = [],
  disabled = false,
}: Props) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);
  const listboxId = useId();

  const nomesListaNorm = useMemo(
    () =>
      new Set(itensAtuais.map((i) => normalizarParaComparacao(i.nome))),
    [itensAtuais],
  );

  const indiceHistorico = useMemo(
    () => construirIndiceHistorico(historicoCompras),
    [historicoCompras],
  );

  const { autocomplete, costumaJunto } = useMemo(
    () => obterSugestoesHistorico(indiceHistorico, valor, nomesListaNorm),
    [indiceHistorico, valor, nomesListaNorm],
  );

  const mostrarPainel =
    !disabled &&
    (autocomplete.length > 0 || costumaJunto !== null);

  function escolherNome(nome: string) {
    if (disabled) return;
    setErro(false);
    const aceito = onPedirCategoria(nome);
    if (aceito !== false) setValor("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const t = valor.trim();
    if (!t) {
      setErro(true);
      return;
    }
    escolherNome(t);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label htmlFor="novo-item" className="sr-only">
          Nome do item
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id="novo-item"
            type="text"
            name="item"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="Ex.: leite integral"
            value={valor}
            disabled={disabled}
            role="combobox"
            aria-expanded={mostrarPainel}
            aria-controls={mostrarPainel ? listboxId : undefined}
            aria-autocomplete="list"
            onChange={(e) => {
              setValor(e.target.value);
              if (erro) setErro(false);
            }}
            className={[
              "min-h-[52px] w-full rounded-2xl border-2 bg-white/90 px-4 text-base text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400",
              erro
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
            ].join(" ")}
          />
          {mostrarPainel ? (
            <div
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[min(18rem,50vh)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-lg shadow-slate-900/10"
            >
              {autocomplete.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Do histórico
                  </p>
                  {autocomplete.map((nome) => (
                    <button
                      key={nome}
                      type="button"
                      role="option"
                      className="flex w-full rounded-xl px-3 py-2.5 text-left text-base text-slate-900 transition hover:bg-blue-50 active:bg-blue-100"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => escolherNome(nome)}
                    >
                      {nome}
                    </button>
                  ))}
                </div>
              ) : null}
              {costumaJunto ? (
                <div
                  className={
                    autocomplete.length > 0
                      ? "mt-2 border-t border-slate-100 pt-2"
                      : ""
                  }
                >
                  <p className="px-2 pb-1 text-[11px] leading-snug text-slate-600">
                    Costuma ir junto com{" "}
                    <span className="font-semibold text-slate-800">
                      {costumaJunto.ancoragemExibicao}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1 pb-0.5 pt-1">
                    {costumaJunto.itens.map((nome) => (
                      <button
                        key={nome}
                        type="button"
                        className="rounded-full border border-blue-200/90 bg-blue-50/90 px-3 py-1.5 text-sm font-medium text-blue-950 transition hover:bg-blue-100 active:scale-[0.98]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => escolherNome(nome)}
                      >
                        {nome}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex min-h-[52px] shrink-0 gap-2">
          <motion.button
            type="submit"
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            disabled={disabled}
            className="min-h-[52px] rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-blue-600 active:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar
          </motion.button>
          {onEscanear ? (
            <motion.button
              type="button"
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              disabled={disabled}
              onClick={() => onEscanear()}
              aria-label="Escanear código de barras"
              className="flex aspect-square min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white/90 text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 shrink-0 text-blue-700"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.5v15M7.5 4.5v15m-1.875-15h1.5m-1.5 9h1.5M12 4.5v15m-1.875-15h1.5m-1.5 6h1.5m-1.5 6h1.5M16.5 4.5v15m-1.875-15h1.5m-1.5 9h1.5M20.25 4.5v15"
                />
              </svg>
            </motion.button>
          ) : null}
        </div>
      </div>
      {erro ? (
        <p className="text-sm font-medium text-red-600" role="status">
          Digite um nome para o item.
        </p>
      ) : null}
    </form>
  );
}
