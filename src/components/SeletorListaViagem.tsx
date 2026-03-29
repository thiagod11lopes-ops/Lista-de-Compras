type ViagemResumo = { id: string; nome: string };

type Props = {
  viagens: ViagemResumo[];
  viagemAtivaId: string;
  onSelecionar: (id: string) => void;
  disabled?: boolean;
};

/** Seletor da lista ativa (gerir listas está no botão fixo ao lado de Configurações). */
export function SeletorListaViagem({
  viagens,
  viagemAtivaId,
  onSelecionar,
  disabled = false,
}: Props) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <label className="sr-only" htmlFor="seletor-viagem-inline">
        Lista de compras ativa
      </label>
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Lista
      </span>
      <select
        id="seletor-viagem-inline"
        disabled={disabled || viagens.length === 0}
        value={viagemAtivaId}
        onChange={(e) => onSelecionar(e.target.value)}
        className="min-h-[44px] w-full min-w-0 flex-1 truncate rounded-xl border-2 border-blue-100 bg-white/90 px-3 text-sm font-semibold text-blue-950 shadow-inner outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
      >
        {viagens.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
