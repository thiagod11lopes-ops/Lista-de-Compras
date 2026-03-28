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

  useEffect(() => {
    if (!focado) setRascunho("");
  }, [focado, quantidade]);

  const valorNoCampo = focado
    ? rascunho
    : temQtd
      ? quantidade.toLocaleString("pt-BR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
        })
      : "";

  function commit() {
    const parsed = parsearQuantidade(rascunho);
    onQuantidadeChange(itemId, parsed);
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
        "box-border h-10 min-h-10 w-full min-w-0 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold tabular-nums leading-tight outline-none",
        somenteLeitura
          ? "cursor-default border-transparent bg-transparent text-slate-600 opacity-90"
          : "border-slate-200 bg-white text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300",
      ].join(" ")}
    />
  );
}
