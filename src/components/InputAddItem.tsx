import { motion } from "framer-motion";
import {
  type FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  /** Indica se há texto não vazio no campo (para o realce da aba Adicionar e o botão laranja). */
  onTextoNovoItemChange?: (temTexto: boolean) => void;
  /** Abre o leitor de código de barras (câmara). */
  onEscanear?: () => void;
  /** Finalizações de todas as listas — base para sugestões por histórico. */
  historicoCompras?: CompraFinalizada[];
  /** Itens da lista ativa (para não sugerir duplicados). */
  itensAtuais?: ItemCompra[];
  disabled?: boolean;
  /** Realce laranja no botão Adicionar e cor laranja no placeholder animado — desligar quando já há itens e lista nomeada (a digitação simulada continua em cinza). */
  tutorialLaranjaAtivo?: boolean;
};

export function InputAddItem({
  onPedirCategoria,
  onTextoNovoItemChange,
  onEscanear,
  historicoCompras = [],
  itensAtuais = [],
  disabled = false,
  tutorialLaranjaAtivo = true,
}: Props) {
  const TEXTO_DIGITADO_PLACEHOLDER = "Escreva o nome do item aqui";
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);
  const [placeholderDigitado, setPlaceholderDigitado] = useState("");
  const [animacaoPlaceholderAtiva, setAnimacaoPlaceholderAtiva] =
    useState(true);
  /** Para ao clicar em Adicionar (ou ao abrir o modal de categoria) até o campo limpar ou o utilizador editar. */
  const [animacoesAdicionarCessadas, setAnimacoesAdicionarCessadas] =
    useState(false);
  const listboxId = useId();
  const timeoutAnimacaoRef = useRef<number | null>(null);

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
    setAnimacoesAdicionarCessadas(true);
    const aceito = onPedirCategoria(nome);
    if (aceito !== false) setValor("");
    else setAnimacoesAdicionarCessadas(false);
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

  useEffect(() => {
    if (!animacaoPlaceholderAtiva || disabled) return;
    let i = 0;

    const limpar = () => {
      if (timeoutAnimacaoRef.current != null) {
        window.clearTimeout(timeoutAnimacaoRef.current);
        timeoutAnimacaoRef.current = null;
      }
    };

    const tick = () => {
      if (!animacaoPlaceholderAtiva || disabled) return;
      if (i <= TEXTO_DIGITADO_PLACEHOLDER.length) {
        setPlaceholderDigitado(TEXTO_DIGITADO_PLACEHOLDER.slice(0, i));
        i += 1;
        timeoutAnimacaoRef.current = window.setTimeout(tick, 75);
        return;
      }
      timeoutAnimacaoRef.current = window.setTimeout(() => {
        setPlaceholderDigitado("");
        i = 0;
        tick();
      }, 1200);
    };

    tick();
    return limpar;
  }, [animacaoPlaceholderAtiva, disabled]);

  const comTextoNoNome = valor.trim().length > 0;
  const temRealceAdicionar =
    comTextoNoNome &&
    !animacoesAdicionarCessadas &&
    tutorialLaranjaAtivo;

  useEffect(() => {
    if (valor === "") setAnimacoesAdicionarCessadas(false);
  }, [valor]);

  useEffect(() => {
    onTextoNovoItemChange?.(temRealceAdicionar);
  }, [temRealceAdicionar, onTextoNovoItemChange]);

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
            placeholder={
              animacaoPlaceholderAtiva
                ? placeholderDigitado
                : "Escreva o nome do item aqui"
            }
            value={valor}
            disabled={disabled}
            role="combobox"
            aria-expanded={mostrarPainel}
            aria-controls={mostrarPainel ? listboxId : undefined}
            aria-autocomplete="list"
            onChange={(e) => {
              setValor(e.target.value);
              setAnimacoesAdicionarCessadas(false);
              if (erro) setErro(false);
            }}
            onFocus={() => setAnimacaoPlaceholderAtiva(false)}
            className={[
              "min-h-[52px] w-full rounded-2xl border-2 bg-white/90 px-4 text-base text-slate-900 shadow-inner outline-none transition",
              animacaoPlaceholderAtiva && !disabled
                ? tutorialLaranjaAtivo
                  ? "placeholder:font-medium placeholder:text-orange-600"
                  : "placeholder:font-medium placeholder:text-slate-500"
                : "placeholder:text-slate-400",
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
          <div className="relative shrink-0">
            {temRealceAdicionar ? (
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
                className="pointer-events-none absolute -top-14 left-1/2 z-20 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-orange-300/95 bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-orange-900 shadow-md shadow-orange-200/60"
              >
                Clique aqui para adicionar o item a sua lista
                <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-orange-300/95 bg-white" />
                <span className="absolute -bottom-3 left-[46%] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-orange-200" />
                <span className="absolute -bottom-5 left-[42%] h-1 w-1 rounded-full bg-white/95 ring-1 ring-orange-200" />
              </motion.div>
            ) : null}
            <motion.button
              type="submit"
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              animate={
                temRealceAdicionar
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
                temRealceAdicionar
                  ? {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : undefined
              }
              disabled={disabled}
              className={[
                "min-h-[52px] rounded-2xl px-6 text-base font-semibold text-white shadow-lg transition active:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
                temRealceAdicionar
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/30 hover:from-orange-700 hover:to-orange-600"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600",
              ].join(" ")}
            >
              Adicionar
            </motion.button>
          </div>
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
