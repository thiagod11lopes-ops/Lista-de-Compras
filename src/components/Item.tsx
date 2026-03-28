import { motion } from "framer-motion";
import type { ItemCompra } from "../types/item";
import { subtotalLinhaMercado } from "../utils/itemMercado";
import { formatarMoedaBRL } from "../utils/moeda";
import { PrecoCampoMercado } from "./PrecoCampoMercado";
import { QuantidadeCampoMercado } from "./QuantidadeCampoMercado";

type Props = {
  item: ItemCompra;
  onToggleMercado: (item: ItemCompra) => void;
  onPrecoChange: (id: string, preco: number | null) => void;
  onQuantidadeChange: (id: string, valor: number | null) => void;
  onRetirarDaListaMercado: (id: string) => void;
  /** Só checklist + nome + excluir; sem preço/qtd/total. */
  listaSimples?: boolean;
};

export function Item({
  item,
  onToggleMercado,
  onPrecoChange,
  onQuantidadeChange,
  onRetirarDaListaMercado,
  listaSimples = false,
}: Props) {
  const marcado = item.comprado;
  const subtotal = subtotalLinhaMercado(item);
  const ul = item.unidadeLista ?? "un";

  if (listaSimples) {
    return (
      <motion.li
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="list-none"
      >
        <div
          className={[
            "flex items-center gap-2 overflow-hidden rounded-2xl border p-3 shadow-sm backdrop-blur-sm transition-[opacity,box-shadow] duration-200 ease-out sm:gap-3 sm:px-3 sm:py-2",
            marcado
              ? "border-slate-300/70 bg-slate-100/70 opacity-[0.52]"
              : "border-white/40 bg-white/80 opacity-100 hover:shadow-md",
            "focus-within:ring-2 focus-within:ring-blue-400/60",
          ].join(" ")}
        >
          <div
            role="checkbox"
            aria-checked={marcado}
            aria-label={`${marcado ? "Desmarcar" : "Marcar"} ${item.nome} como comprado`}
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              onToggleMercado(item);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleMercado(item);
              }
            }}
            className="flex min-h-[44px] min-w-0 flex-1 cursor-pointer select-none items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                marcado
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-blue-300 bg-white",
              ].join(" ")}
            >
              {marcado ? (
                <svg
                  viewBox="0 0 12 12"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 6l3 3 5-6" />
                </svg>
              ) : null}
            </span>
            <span
              className={[
                "min-w-0 flex-1 truncate text-base font-medium text-slate-800 transition-all",
                marcado ? "line-through decoration-slate-500" : "",
              ].join(" ")}
            >
              {item.nome}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetirarDaListaMercado(item.id);
            }}
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-lg border transition active:scale-[0.96]",
              marcado
                ? "border-slate-300/80 bg-slate-200/50 text-slate-600 hover:bg-slate-200/80"
                : "border-red-200/90 bg-white text-red-600 hover:bg-red-50",
            ].join(" ")}
            aria-label={`Retirar ${item.nome} da lista do mercado`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </motion.li>
    );
  }

  return (
    <motion.li
      layout
      initial={false}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="list-none"
    >
      <div
        className={[
          "relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 shadow-sm backdrop-blur-sm transition-[opacity,box-shadow] duration-200 ease-out sm:flex-row sm:items-stretch sm:gap-0 sm:p-0",
          marcado
            ? "border-slate-300/70 bg-slate-100/70 opacity-[0.52]"
            : "border-white/40 bg-white/80 opacity-100 hover:shadow-md",
          "focus-within:ring-2 focus-within:ring-blue-400/60",
        ].join(" ")}
      >
        <div
          role="checkbox"
          aria-checked={marcado}
          aria-label={`${marcado ? "Desmarcar" : "Marcar"} ${item.nome} como comprado`}
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            onToggleMercado(item);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleMercado(item);
            }
          }}
          className="flex min-h-[44px] min-w-0 cursor-pointer select-none items-center gap-3 outline-none sm:min-w-[min(40%,12rem)] sm:max-w-[min(55%,20rem)] sm:flex-none sm:px-3 sm:py-2 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <span
            aria-hidden
            className={[
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
              marcado
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-blue-300 bg-white",
            ].join(" ")}
          >
            {marcado ? (
              <svg
                viewBox="0 0 12 12"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-6" />
              </svg>
            ) : null}
          </span>
          <span
            className={[
              "min-w-0 flex-1 truncate text-base font-medium text-slate-800 transition-all",
              marcado ? "line-through decoration-slate-500" : "",
            ].join(" ")}
          >
            {item.nome}
          </span>
        </div>

        <div
          className={[
            "grid min-h-0 min-w-0 flex-1 grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-x-2 gap-y-0.5 border-t pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3 sm:pr-3 sm:py-2",
            marcado ? "border-slate-300/80" : "border-slate-200/80",
          ].join(" ")}
        >
          <span
            className={[
              "min-w-0 self-end text-[9px] font-semibold uppercase leading-none tracking-wide",
              marcado ? "text-slate-500" : "text-blue-900/70",
            ].join(" ")}
          >
            {ul === "kg" ? "Preço/kg" : "Preço un."}
          </span>
          <span
            className={[
              "min-w-0 self-end text-[9px] font-semibold uppercase leading-none tracking-wide",
              marcado ? "text-slate-500" : "text-blue-900/70",
            ].join(" ")}
          >
            {ul === "kg" ? "Qtd kg" : "Qtd UN"}
          </span>
          <span
            className={[
              "min-w-0 self-end text-[9px] font-semibold uppercase leading-none tracking-wide",
              marcado ? "text-slate-500" : "text-blue-900/70",
            ].join(" ")}
          >
            Total
          </span>
          <div className="row-span-2 flex items-end justify-end self-stretch">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetirarDaListaMercado(item.id);
              }}
              className={[
                "flex size-10 shrink-0 items-center justify-center rounded-lg border transition active:scale-[0.96]",
                marcado
                  ? "border-slate-300/80 bg-slate-200/50 text-slate-600 hover:bg-slate-200/80"
                  : "border-red-200/90 bg-white text-red-600 hover:bg-red-50",
              ].join(" ")}
              aria-label={`Retirar ${item.nome} da lista do mercado`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
          <div className="min-w-0">
            <PrecoCampoMercado
              itemId={item.id}
              nomeItem={item.nome}
              preco={item.preco}
              somenteLeitura={marcado}
              modoPreco={ul}
              onPrecoChange={onPrecoChange}
            />
          </div>
          <div className="min-w-0">
            <QuantidadeCampoMercado
              itemId={item.id}
              nomeItem={item.nome}
              quantidade={item.quantidade}
              somenteLeitura={marcado}
              unidadeLista={ul}
              onQuantidadeChange={onQuantidadeChange}
            />
          </div>
          <div
            role="status"
            className={[
              "flex h-10 min-h-10 min-w-0 items-center justify-end rounded-lg border px-2 text-right text-sm font-bold tabular-nums leading-none",
              marcado
                ? "border-transparent bg-transparent text-slate-600"
                : "border-slate-200/90 bg-slate-50/90 text-blue-950",
            ].join(" ")}
            aria-label={
              subtotal != null
                ? `Total da linha ${formatarMoedaBRL(subtotal)}`
                : ul === "kg"
                  ? "Informe o preço por kg e a quantidade para calcular o total"
                  : "Informe o preço unitário e a quantidade para calcular o total"
            }
          >
            {subtotal != null ? formatarMoedaBRL(subtotal) : "—"}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
