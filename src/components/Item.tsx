import { motion } from "framer-motion";
import type { ItemCompra } from "../types/item";
import { subtotalLinhaMercado } from "../utils/itemMercado";
import { formatarMoedaBRL } from "../utils/moeda";
import { PrecoCampoMercado } from "./PrecoCampoMercado";
import { QuantidadeCampoMercado } from "./QuantidadeCampoMercado";

const FRASE_TUTO_PRECO_QTD =
  "Adicione o preço e a quantidade do item";
const FRASE_TUTO_CHECKBOX = "Clique aqui para confirmar a compra";

type Props = {
  item: ItemCompra;
  onToggleMercado: (item: ItemCompra) => void;
  onPrecoChange: (id: string, preco: number | null) => void;
  onQuantidadeChange: (id: string, valor: number | null) => void;
  onRetirarDaListaMercado: (id: string) => void;
  /** Só checklist + nome + excluir; sem preço/qtd/total. */
  listaSimples?: boolean;
  /** Tutorial lista completa + resumo minimizado: pulso nos campos preço/qtd. */
  destaqueTutorialPrecoQtd?: boolean;
  /** Tutorial: pulso no checkbox após preço e quantidade preenchidos. */
  destaqueTutorialCheckbox?: boolean;
};

export function Item({
  item,
  onToggleMercado,
  onPrecoChange,
  onQuantidadeChange,
  onRetirarDaListaMercado,
  listaSimples = false,
  destaqueTutorialPrecoQtd = false,
  destaqueTutorialCheckbox = false,
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
            "flex items-center gap-2 overflow-hidden rounded-2xl border p-2.5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-[opacity,box-shadow,border-color] duration-200 ease-out sm:gap-2.5 sm:px-3 sm:py-2.5",
            marcado
              ? "border-slate-300/70 bg-slate-100/80 opacity-[0.52]"
              : "border-slate-200/80 bg-white/95 opacity-100 ring-1 ring-slate-900/[0.04] hover:shadow-md hover:ring-slate-900/[0.07]",
            "focus-within:ring-2 focus-within:ring-blue-400/50",
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
            className="flex min-h-9 min-w-0 flex-1 cursor-pointer select-none items-center gap-2 rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 shadow-sm transition-colors",
                marcado
                  ? "border-blue-600 bg-blue-600 text-white shadow-blue-900/20"
                  : "border-blue-400/90 bg-white",
              ].join(" ")}
            >
              {marcado ? (
                <svg
                  viewBox="0 0 12 12"
                  className="h-2.5 w-2.5"
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
                "min-w-0 flex-1 truncate text-xs font-semibold leading-tight tracking-tight text-slate-800 transition-all sm:text-sm",
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
              "flex size-9 shrink-0 items-center justify-center rounded-lg border transition active:scale-[0.96]",
              marcado
                ? "border-slate-300/80 bg-slate-200/50 text-slate-600 hover:bg-slate-200/80"
                : "border-slate-200/90 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
            ].join(" ")}
            aria-label={`Retirar ${item.nome} da lista do mercado`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-3.5 w-3.5"
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
          "relative flex flex-col overflow-hidden rounded-2xl border shadow-[0_1px_3px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-[opacity,box-shadow,border-color] duration-200 ease-out sm:flex-row sm:items-stretch sm:gap-0",
          marcado
            ? "border-slate-300/75 bg-slate-100/75 opacity-[0.52]"
            : "border-slate-200/85 bg-white/95 opacity-100 ring-1 ring-slate-900/[0.04] hover:shadow-md hover:ring-slate-900/[0.07]",
          "focus-within:ring-2 focus-within:ring-blue-400/50",
        ].join(" ")}
      >
        <div
          className={[
            "min-w-0 px-2 pb-1.5 pt-2 sm:flex sm:flex-none sm:flex-col sm:justify-center sm:px-2.5 sm:pb-2 sm:pt-2",
            !marcado && !destaqueTutorialCheckbox
              ? "bg-gradient-to-b from-slate-50/90 to-white sm:bg-gradient-to-r sm:from-slate-50/80 sm:to-white/60"
              : "",
            destaqueTutorialCheckbox
              ? "relative z-[2] sm:min-w-[min(24%,7.5rem)] sm:max-w-[min(33%,13.2rem)]"
              : "sm:min-w-[min(24%,7.5rem)] sm:max-w-[min(33%,13.2rem)]",
          ].join(" ")}
        >
          {destaqueTutorialCheckbox ? (
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
              className="pointer-events-none absolute -top-[3.25rem] left-0 z-[50] w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-amber-300/95 bg-white px-3 py-1.5 text-left text-[11px] font-semibold leading-snug text-amber-900 shadow-md shadow-amber-200/60 sm:left-1/2 sm:-translate-x-1/2"
            >
              {FRASE_TUTO_CHECKBOX}
              <span className="absolute -bottom-2 left-8 h-3 w-3 rotate-45 rounded-[2px] border-b border-r border-amber-300/95 bg-white" />
              <span className="absolute -bottom-3 left-[1.85rem] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-amber-200" />
              <span className="absolute -bottom-5 left-[1.65rem] h-1 w-1 rounded-full bg-white/95 ring-1 ring-amber-200" />
            </motion.div>
          ) : null}
          {destaqueTutorialCheckbox ? (
            <motion.div
              layout={false}
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
              className="flex min-h-9 min-w-0 cursor-pointer select-none items-center gap-2 rounded-lg border-2 border-orange-500 outline-none transition-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              animate={{
                scale: [1, 1.03, 1],
                opacity: [1, 0.92, 1],
                boxShadow: [
                  "0 0 0 0 rgba(251, 146, 60, 0.72)",
                  "0 0 0 10px rgba(251, 146, 60, 0)",
                  "0 0 0 0 rgba(251, 146, 60, 0.72)",
                ],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span
                aria-hidden
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-none",
                  marcado
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-900/20"
                    : "border-orange-400 bg-white",
                ].join(" ")}
              >
                {marcado ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5"
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
                  "min-w-0 flex-1 truncate text-xs font-semibold leading-tight tracking-tight text-slate-800 transition-all sm:text-sm",
                  marcado ? "line-through decoration-slate-500" : "",
                ].join(" ")}
              >
                {item.nome}
              </span>
            </motion.div>
          ) : (
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
              className="flex min-h-9 min-w-0 cursor-pointer select-none items-center gap-2 rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 shadow-sm transition-colors",
                  marcado
                    ? "border-blue-600 bg-blue-600 text-white shadow-blue-900/20"
                    : "border-blue-400/90 bg-white",
                ].join(" ")}
              >
                {marcado ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5"
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
                  "min-w-0 flex-1 truncate text-xs font-semibold leading-tight tracking-tight text-slate-800 transition-all sm:text-sm",
                  marcado ? "line-through decoration-slate-500" : "",
                ].join(" ")}
              >
                {item.nome}
              </span>
            </div>
          )}
        </div>

        <div
          className={[
            "relative grid min-h-0 min-w-0 flex-1 grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-x-2.5 gap-y-1 border-t px-3 pb-3 pt-2 sm:border-t-0 sm:border-l sm:px-3.5 sm:pb-3.5 sm:pl-4 sm:pr-3 sm:pt-3",
            marcado
              ? "border-slate-300/70 bg-slate-50/50"
              : "border-slate-200/80 bg-gradient-to-b from-slate-50/70 via-white to-white sm:bg-gradient-to-br",
            destaqueTutorialPrecoQtd ? "z-[1]" : "",
            "rounded-b-2xl sm:rounded-none sm:rounded-r-2xl",
          ].join(" ")}
        >
          {destaqueTutorialPrecoQtd ? (
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
              className="pointer-events-none absolute -top-[3.25rem] left-0 z-[50] w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-orange-300/95 bg-white px-3 py-1.5 text-left text-[11px] font-semibold leading-snug text-orange-900 shadow-md shadow-orange-200/60"
            >
              {FRASE_TUTO_PRECO_QTD}
              <span className="absolute -bottom-2 left-10 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-orange-300/95 bg-white" />
              <span className="absolute -bottom-3 left-[2.35rem] h-1.5 w-1.5 rounded-full bg-white/95 ring-1 ring-orange-200" />
              <span className="absolute -bottom-5 left-[2.1rem] h-1 w-1 rounded-full bg-white/95 ring-1 ring-orange-200" />
            </motion.div>
          ) : null}
          <span
            className={[
              "min-w-0 self-end pb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider",
              marcado ? "text-slate-500" : "text-slate-500",
            ].join(" ")}
          >
            {ul === "kg" ? "Preço/kg" : "Preço un."}
          </span>
          <span
            className={[
              "min-w-0 self-end pb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider",
              marcado ? "text-slate-500" : "text-slate-500",
            ].join(" ")}
          >
            {ul === "kg" ? "Qtd kg" : "Qtd UN"}
          </span>
          <span
            className={[
              "min-w-0 self-end pb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider",
              marcado ? "text-slate-500" : "text-blue-800/75",
            ].join(" ")}
          >
            Total
          </span>
          <div className="row-span-2 flex items-end justify-end self-stretch pb-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetirarDaListaMercado(item.id);
              }}
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-lg border transition active:scale-[0.96]",
                marcado
                  ? "border-slate-300/80 bg-slate-200/50 text-slate-600 hover:bg-slate-200/80"
                  : "border-slate-200/90 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
              ].join(" ")}
              aria-label={`Retirar ${item.nome} da lista do mercado`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-3.5 w-3.5"
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
              "flex h-11 min-h-[44px] min-w-0 items-center justify-end rounded-xl border px-2.5 text-right text-sm font-bold tabular-nums leading-none shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]",
              marcado
                ? "border-transparent bg-transparent text-slate-600 shadow-none"
                : subtotal != null
                  ? "border-emerald-200/90 bg-gradient-to-b from-emerald-50/95 to-emerald-50/50 text-emerald-950"
                  : "border-slate-200/90 bg-slate-100/80 text-slate-500",
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
