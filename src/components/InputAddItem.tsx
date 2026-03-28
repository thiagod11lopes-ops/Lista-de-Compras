import { motion } from "framer-motion";
import { type FormEvent, useState } from "react";

type Props = {
  /** Chamado com o nome válido; o pai abre o modal de categoria. Devolva `false` para não limpar o campo (ex.: item duplicado). */
  onPedirCategoria: (nome: string) => boolean | void;
  disabled?: boolean;
};

export function InputAddItem({ onPedirCategoria, disabled = false }: Props) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const t = valor.trim();
    if (!t) {
      setErro(true);
      return;
    }
    setErro(false);
    const aceito = onPedirCategoria(t);
    if (aceito !== false) setValor("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label htmlFor="novo-item" className="sr-only">
          Nome do item
        </label>
        <input
          id="novo-item"
          type="text"
          name="item"
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Ex.: leite integral"
          value={valor}
          disabled={disabled}
          onChange={(e) => {
            setValor(e.target.value);
            if (erro) setErro(false);
          }}
          className={[
            "min-h-[52px] flex-1 rounded-2xl border-2 bg-white/90 px-4 text-base text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400",
            erro
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-200",
          ].join(" ")}
        />
        <motion.button
          type="submit"
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          disabled={disabled}
          className="min-h-[52px] shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-blue-600 active:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </motion.button>
      </div>
      {erro ? (
        <p className="text-sm font-medium text-red-600" role="status">
          Digite um nome para o item.
        </p>
      ) : null}
    </form>
  );
}
