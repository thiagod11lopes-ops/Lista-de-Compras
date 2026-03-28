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

  useEffect(() => {
    if (!focado) setRascunho("");
  }, [focado, preco]);

  const temPreco =
    preco !== undefined && preco !== null && Number.isFinite(preco);

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

  function commit() {
    const parsed = parsearEntradaMoeda(rascunho);
    onPrecoChange(itemId, parsed);
  }

  function handleBlur() {
    setFocado(false);
    commit();
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
        "box-border h-10 min-h-10 w-full min-w-0 rounded-lg border px-2 py-1.5 text-right text-sm font-bold tabular-nums leading-tight tracking-tight outline-none",
        somenteLeitura
          ? "cursor-default border-transparent bg-transparent text-slate-600 opacity-90"
          : "border-slate-200 bg-white text-blue-950 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-400 focus:ring-1 focus:ring-blue-300",
      ].join(" ")}
    />
  );
}
