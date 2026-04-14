import { useEffect, useState } from "react";
import { formatarMoedaBRL, parsearEntradaMoeda } from "../utils/moeda";

type Props = {
  itemId: string;
  nomeItem: string;
  preco: number | null | undefined;
  /** Item marcado na lista: não editar preço até desmarcar */
  somenteLeitura?: boolean;
  /** un = preço por unidade; kg = preço por quilograma */
  modoPreco?: "un" | "kg";
  onPrecoChange: (id: string, preco: number | null) => void;
};

export function PrecoCampoMercado({
  itemId,
  nomeItem,
  preco,
  somenteLeitura = false,
  modoPreco = "un",
  onPrecoChange,
}: Props) {
  const [focado, setFocado] = useState(false);
  const [rascunho, setRascunho] = useState("");

  const temPreco =
    preco !== undefined && preco !== null && Number.isFinite(preco);

  /** Após o primeiro valor guardado no item, o realce laranja não volta (até limpar o preço). */
  const [entradaInicialConcluida, setEntradaInicialConcluida] =
    useState(temPreco);

  useEffect(() => {
    setEntradaInicialConcluida(temPreco);
  }, [itemId, temPreco]);

  useEffect(() => {
    if (!focado) setRascunho("");
  }, [focado, preco]);

  const primeiraDigitacaoAtiva =
    !somenteLeitura &&
    !entradaInicialConcluida &&
    (focado || rascunho.length > 0);

  const valorNoCampo = focado
    ? rascunho
    : temPreco
      ? formatarMoedaBRL(preco as number)
      : "";

  function handleFocus() {
    setFocado(true);
    if (temPreco) {
      setRascunho(
        (preco as number).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    } else {
      setRascunho("");
    }
  }

  function handleBlur() {
    setFocado(false);
    const parsed = parsearEntradaMoeda(rascunho);
    onPrecoChange(itemId, parsed);
    if (parsed != null && Number.isFinite(parsed)) {
      setEntradaInicialConcluida(true);
    }
    setRascunho("");
  }

  return (
    <input
      type="text"
      readOnly={somenteLeitura}
      tabIndex={somenteLeitura ? -1 : undefined}
      inputMode="decimal"
      enterKeyHint="done"
      autoComplete="off"
      aria-label={
        modoPreco === "kg"
          ? `Preço por quilograma de ${nomeItem}`
          : `Preço unitário de ${nomeItem}`
      }
      placeholder="R$ 0,00"
      value={valorNoCampo}
      onFocus={somenteLeitura ? undefined : handleFocus}
      onBlur={somenteLeitura ? undefined : handleBlur}
      onChange={
        somenteLeitura ? undefined : (e) => setRascunho(e.target.value)
      }
      onKeyDown={
        somenteLeitura
          ? undefined
          : (e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }
      }
      className={[
        "box-border h-11 min-h-[44px] w-full min-w-0 rounded-xl border px-2.5 py-2 text-right text-sm font-bold tabular-nums leading-tight tracking-tight shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-150",
        somenteLeitura
          ? "cursor-default border-transparent bg-transparent text-slate-600 opacity-90 shadow-none"
          : primeiraDigitacaoAtiva
            ? "border-orange-400 bg-gradient-to-b from-orange-50/95 to-amber-50/50 text-orange-950 placeholder:text-orange-400/85 placeholder:font-normal hover:border-orange-500 focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(234,88,12,0.1),0_0_0_3px_rgba(251,146,60,0.3)] focus:ring-0"
            : "border-slate-200/95 bg-white text-blue-950 placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300 focus:border-blue-500 focus:shadow-[inset_0_1px_2px_rgba(37,99,235,0.06),0_0_0_3px_rgba(59,130,246,0.15)] focus:ring-0",
      ].join(" ")}
    />
  );
}
