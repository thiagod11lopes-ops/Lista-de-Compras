import { motion } from "framer-motion";
import { useId } from "react";
import type { ItemCompra } from "../types/item";

type Props = {
  item: ItemCompra;
  onAlternarListaMercado: (id: string) => void;
};

/** Comprar Novamente: marcar envia à Lista do Mercado; a linha fica opaca e permanece na aba. */
export function ItemFaltando({ item, onAlternarListaMercado }: Props) {
  const inputId = useId();
  const enviadoAoMercado = item.retiradoParaMercadoNovamente === true;

  return (
    <motion.li layout className="list-none">
      <div
        className={[
          "flex min-h-[52px] items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-3 shadow-sm backdrop-blur-sm transition-opacity duration-200 sm:px-4",
          enviadoAoMercado ? "opacity-[0.52]" : "opacity-100",
        ].join(" ")}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={enviadoAoMercado}
          onChange={() => onAlternarListaMercado(item.id)}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-amber-500 accent-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
          aria-label={
            enviadoAoMercado
              ? `Retirar ${item.nome} da Lista do Mercado`
              : `Enviar ${item.nome} para a Lista do Mercado`
          }
        />
        <label
          htmlFor={inputId}
          className="min-w-0 flex-1 cursor-pointer select-none text-base font-medium text-amber-950"
        >
          {item.nome}
        </label>
      </div>
    </motion.li>
  );
}
