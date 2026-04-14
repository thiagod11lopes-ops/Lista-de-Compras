import { useEffect, useState } from "react";

type Props = {
  itemId: string;
  nomeItem: string;
  quantidade: number | undefined;
  somenteLeitura?: boolean;
  /** un = quantidade em unidades; kg = peso em kg */
  unidadeLista?: "un" | "kg";
  onQuantidadeChange: (id: string, valor: number | null) => void;
};

function parsearQuantidade(texto: string): number | null {
  const t = texto.trim().replace(/\s/g, "").replace(",", ".");
  if (t === "") return null;
  const n = parseFloat(t);
  if (Number.isNaN(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

export function QuantidadeCampoMercado({
  itemId,
  nomeItem,
  quantidade,
  somenteLeitura = false,
  unidadeLista = "un",
  onQuantidadeChange,
}: Props) {
  const temQtd =
    typeof quantidade === "number" &&
    Number.isFinite(quantidade) &&
    quantidade > 0;

  const [focado, setFocado] = useState(false);
  const [rascunho, setRascunho] = useState("");

  const [entradaInicialConcluida, setEntradaInicialConcluida] =
    useState(temQtd);

  useEffect(() => {
    setEntradaInicialConcluida(temQtd);
  }, [itemId, temQtd]);

  useEffect(() => {
    if (!focado) setRascunho("");
  }, [focado, quantidade]);

  const primeiraDigitacaoAtiva =
    !somenteLeitura &&
    !entradaInicialConcluida &&
    (focado || rascunho.length > 0);

  const valorNoCampo = focado
    ? rascunho
    : temQtd
      ? quantidade.toLocaleString("pt-BR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
        })
      : "";

  function handleBlur() {
    setFocado(false);
    const parsed = parsearQuantidade(rascunho);
    onQuantidadeChange(itemId, parsed);
    if (parsed != null) {
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
        unidadeLista === "kg"
          ? `Quantidade em quilogramas de ${nomeItem}`
          : `Quantidade em unidades de ${nomeItem}`
      }
      placeholder="—"
      value={valorNoCampo}
      onFocus={
        somenteLeitura
          ? undefined
          : () => {
              setFocado(true);
              setRascunho(
                temQtd
                  ? quantidade % 1 === 0
                    ? String(quantidade)
                    : quantidade.toLocaleString("pt-BR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 3,
                      })
                  : "",
              );
            }
      }
      onBlur={somenteLeitura ? undefined : handleBlur}
      onChange={
        somenteLeitura ? undefined : (e) => setRascunho(e.target.value)
      }
      onKeyDown={
        somenteLeitura
          ? undefined
          : (e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }
      }
      className={[
        "box-border h-11 min-h-[44px] w-full min-w-0 rounded-xl border px-2.5 py-2 text-center text-sm font-semibold tabular-nums leading-tight shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-150",
        somenteLeitura
          ? "cursor-default border-transparent bg-transparent text-slate-600 opacity-90 shadow-none"
          : primeiraDigitacaoAtiva
            ? "border-orange-400 bg-gradient-to-b from-orange-50/95 to-amber-50/50 text-orange-950 placeholder:text-orange-400/85 hover:border-orange-500 focus:border-orange-500 focus:shadow-[inset_0_1px_2px_rgba(234,88,12,0.1),0_0_0_3px_rgba(251,146,60,0.3)] focus:ring-0"
            : "border-slate-200/95 bg-white text-blue-950 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:shadow-[inset_0_1px_2px_rgba(37,99,235,0.06),0_0_0_3px_rgba(59,130,246,0.15)] focus:ring-0",
      ].join(" ")}
    />
  );
}
