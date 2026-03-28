import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompraFinalizada } from "../types/balanco";
import {
  chaveMesAtual,
  gastoPorItem,
  gastoPorMes,
  rotuloMesPtBr,
  totaisGerais,
} from "../utils/balancoAnalytics";
import { formatarMoedaBRL } from "../utils/moeda";

type Props = {
  comprasFinalizadas: CompraFinalizada[];
};

type BalançoSubaba = "visao" | "mes" | "itens" | "historico";

const SUBABAS: { id: BalançoSubaba; label: string }[] = [
  { id: "visao", label: "Visão geral" },
  { id: "mes", label: "Por mês" },
  { id: "itens", label: "Por item" },
  { id: "historico", label: "Histórico" },
];

const CORES_GRAFICO = [
  "#4f46e5",
  "#0d9488",
  "#d97706",
  "#7c3aed",
  "#0369a1",
  "#be123c",
  "#15803d",
  "#a16207",
];

function TooltipMoeda({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      {label != null ? (
        <p className="mb-1 font-semibold text-slate-800">{label}</p>
      ) : null}
      <p className="tabular-nums font-medium text-indigo-900">
        {typeof v === "number" ? formatarMoedaBRL(v) : "—"}
      </p>
    </div>
  );
}

function TooltipPie({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    payload?: { pct?: number; name?: string; value?: number };
  }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const inner = "payload" in p && p.payload ? p.payload : p;
  const nome = inner.name ?? "";
  const v = inner.value;
  const pct = "pct" in inner ? inner.pct : undefined;
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-semibold text-slate-800">{nome}</p>
      <p className="tabular-nums text-indigo-900">
        {typeof v === "number" ? formatarMoedaBRL(v) : "—"}
        {typeof pct === "number" ? (
          <span className="ml-1 text-slate-500">({pct.toFixed(1)}%)</span>
        ) : null}
      </p>
    </div>
  );
}

export function AbaBalanço({ comprasFinalizadas }: Props) {
  const [subAba, setSubAba] = useState<BalançoSubaba>("visao");
  const [detalheListaSimples, setDetalheListaSimples] =
    useState<CompraFinalizada | null>(null);
  const [listasSimplesExpandido, setListasSimplesExpandido] = useState(false);
  const tituloModalListaSimplesId = useId();

  const comprasComValores = useMemo(
    () => comprasFinalizadas.filter((c) => c.tipoLista !== "simples"),
    [comprasFinalizadas],
  );
  const comprasListaSimples = useMemo(
    () => comprasFinalizadas.filter((c) => c.tipoLista === "simples"),
    [comprasFinalizadas],
  );

  useEffect(() => {
    if (comprasFinalizadas.length === 0) {
      setSubAba("visao");
    }
  }, [comprasFinalizadas.length]);

  const porMes = useMemo(
    () => gastoPorMes(comprasComValores),
    [comprasComValores],
  );
  const porItem = useMemo(
    () => gastoPorItem(comprasComValores),
    [comprasComValores],
  );
  const totais = useMemo(
    () => totaisGerais(comprasComValores),
    [comprasComValores],
  );

  const dadosPizza = useMemo(() => {
    const lista = porItem.filter((i) => i.total > 0);
    if (lista.length === 0) return [];
    const top = lista.slice(0, 5);
    const rest = lista.slice(5);
    const totalGeral = lista.reduce((s, x) => s + x.total, 0);
    const rows = top.map((x) => ({
      name:
        x.nomeExibicao.length > 28
          ? `${x.nomeExibicao.slice(0, 26)}…`
          : x.nomeExibicao,
      value: x.total,
      pct: totalGeral > 0 ? (100 * x.total) / totalGeral : 0,
    }));
    if (rest.length > 0) {
      const v = rest.reduce((s, x) => s + x.total, 0);
      rows.push({
        name: "Outros",
        value: v,
        pct: totalGeral > 0 ? (100 * v) / totalGeral : 0,
      });
    }
    return rows;
  }, [porItem]);

  const topItensBarra = useMemo(() => {
    return porItem.slice(0, 12).map((x) => ({
      nome:
        x.nomeExibicao.length > 22
          ? `${x.nomeExibicao.slice(0, 20)}…`
          : x.nomeExibicao,
      total: x.total,
    }));
  }, [porItem]);

  const fmtData = (ts: number) =>
    new Date(ts).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const mesAtualRotulo = rotuloMesPtBr(chaveMesAtual());

  useEffect(() => {
    if (!detalheListaSimples) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detalheListaSimples]);

  useEffect(() => {
    if (!detalheListaSimples) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDetalheListaSimples(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detalheListaSimples]);

  return (
    <section className="space-y-4" aria-labelledby="titulo-balanco">
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl" aria-hidden>
          📊
        </span>
        <h2
          id="titulo-balanco"
          className="text-lg font-bold tracking-tight text-blue-950"
        >
          Balanço
        </h2>
      </div>
      <p className="px-1 text-sm text-slate-600">
        Análise das compras registradas ao finalizar na Lista do Mercado.
      </p>

      {comprasListaSimples.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/95 to-white shadow-sm">
          <button
            type="button"
            id="titulo-listas-simples"
            aria-expanded={listasSimplesExpandido}
            aria-controls="painel-listas-simples-balanco"
            onClick={() => setListasSimplesExpandido((v) => !v)}
            className="flex w-full min-h-[52px] items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-amber-100/40 active:bg-amber-100/60"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-amber-950">
                Listas Simples Utilizadas sem valores
              </span>
              <span className="mt-0.5 block text-xs text-amber-900/80">
                {comprasListaSimples.length}{" "}
                {comprasListaSimples.length === 1
                  ? "finalização"
                  : "finalizações"}{" "}
                — toque para {listasSimplesExpandido ? "ocultar" : "expandir"}
              </span>
            </div>
            <span
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/80 bg-white/90 text-amber-900 transition",
                listasSimplesExpandido ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>
          {listasSimplesExpandido ? (
            <div
              id="painel-listas-simples-balanco"
              className="border-t border-amber-100/90 px-4 pb-4 pt-2"
              role="region"
              aria-labelledby="titulo-listas-simples"
            >
              <p className="text-xs leading-relaxed text-amber-900/85">
                Finalizações em <strong>lista simples</strong> (só checklist, sem
                preço nem quantidade). Não entram nos totais e gráficos abaixo.
              </p>
              <ul className="mt-3 space-y-2">
                {comprasListaSimples.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 rounded-xl border border-amber-100/90 bg-white/90 px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <p className="text-sm font-semibold tabular-nums text-slate-800">
                      {fmtData(c.finalizadaEm)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDetalheListaSimples(c)}
                      className="min-h-[44px] shrink-0 rounded-xl border border-amber-300/90 bg-amber-100/80 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-200/60 active:scale-[0.98]"
                    >
                      Lista de Compras Feita
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence>
        {detalheListaSimples ? (
          <motion.div
            key={detalheListaSimples.id}
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
              aria-label="Fechar"
              onClick={() => setDetalheListaSimples(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloModalListaSimplesId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="relative z-10 flex max-h-[min(85dvh,28rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-amber-200/90 bg-white shadow-2xl shadow-amber-900/20"
            >
              <div className="shrink-0 border-b border-amber-100 px-5 pb-3 pt-5">
                <h2
                  id={tituloModalListaSimplesId}
                  className="text-lg font-bold text-amber-950"
                >
                  Itens comprados neste dia
                </h2>
                <p className="mt-1 text-sm font-medium tabular-nums text-slate-600">
                  {fmtData(detalheListaSimples.finalizadaEm)}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                <ul className="space-y-2">
                  {detalheListaSimples.itens.map((linha, idx) => (
                    <li
                      key={`${detalheListaSimples.id}-${idx}-${linha.nome}`}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      {linha.nome}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 border-t border-amber-100 bg-amber-50/80 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setDetalheListaSimples(null)}
                  className="min-h-[48px] w-full rounded-2xl bg-amber-600 py-3 text-base font-semibold text-white shadow-md shadow-amber-600/25 transition active:scale-[0.98]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {comprasFinalizadas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-10 text-center text-sm text-slate-600">
          Ainda não há compras finalizadas. Na aba Lista do Mercado, marque os
          itens e use &quot;Finalizar compras&quot; para registrar aqui.
        </p>
      ) : comprasComValores.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-8 text-center text-sm text-slate-600">
          Ainda não há compras com valores em reais. Use a{" "}
          <strong>lista completa</strong> na Lista do Mercado para ver totais e
          gráficos nesta área.
        </p>
      ) : (
        <>
          <nav
            className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-1 shadow-sm"
            aria-label="Seções do balanço"
          >
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4" role="tablist">
              {SUBABAS.map((s) => {
                const sel = subAba === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={sel}
                    onClick={() => setSubAba(s.id)}
                    className={[
                      "min-h-[44px] rounded-xl px-2 py-2 text-center text-[11px] font-semibold leading-tight transition sm:text-xs",
                      sel
                        ? "bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-200/80"
                        : "text-slate-600 active:bg-white/80 sm:hover:bg-white/70",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {subAba === "visao" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiCard
                  titulo="Total histórico"
                  valor={formatarMoedaBRL(totais.totalHistorico)}
                  subtitulo="Todas as finalizações"
                />
                <KpiCard
                  titulo="Mês atual"
                  valor={formatarMoedaBRL(totais.totalMesAtual)}
                  subtitulo={mesAtualRotulo}
                  destaque
                />
                <KpiCard
                  titulo="Compras"
                  valor={String(totais.numCompras)}
                  subtitulo="Finalizações registradas"
                />
                <KpiCard
                  titulo="Ticket médio"
                  valor={formatarMoedaBRL(totais.ticketMedio)}
                  subtitulo="Por finalização"
                />
              </div>

              <motion.div
                layout
                className="rounded-2xl border border-slate-200/90 bg-white px-3 py-4 shadow-sm"
              >
                <h3 className="mb-1 px-1 text-sm font-semibold text-slate-800">
                  Evolução do gasto por mês
                </h3>
                <p className="mb-3 px-1 text-xs text-slate-500">
                  Soma dos totais de cada finalização, agrupada por mês civil.
                </p>
                <div className="h-[240px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={porMes}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="fillMes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="rotulo"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#cbd5e1" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) =>
                          v >= 1000
                            ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
                            : String(v)
                        }
                        axisLine={{ stroke: "#cbd5e1" }}
                      />
                      <Tooltip content={<TooltipMoeda />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Gasto"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="url(#fillMes)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {dadosPizza.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <motion.div
                    layout
                    className="rounded-2xl border border-slate-200/90 bg-white px-3 py-4 shadow-sm"
                  >
                    <h3 className="mb-1 px-1 text-sm font-semibold text-slate-800">
                      Participação por item (top 5)
                    </h3>
                    <p className="mb-2 px-1 text-xs text-slate-500">
                      Com base no valor informado por item em todas as compras.
                    </p>
                    <div className="h-[260px] w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dadosPizza}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={88}
                            paddingAngle={2}
                          >
                            {dadosPizza.map((_, i) => (
                              <Cell
                                key={i}
                                fill={CORES_GRAFICO[i % CORES_GRAFICO.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<TooltipPie />} />
                          <Legend
                            wrapperStyle={{ fontSize: "11px" }}
                            formatter={(value) => (
                              <span className="text-slate-700">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    layout
                    className="rounded-2xl border border-slate-200/90 bg-white px-3 py-4 shadow-sm"
                  >
                    <h3 className="mb-1 px-1 text-sm font-semibold text-slate-800">
                      Maiores gastos por item
                    </h3>
                    <p className="mb-3 px-1 text-xs text-slate-500">
                      Até 12 itens com maior valor acumulado.
                    </p>
                    <div className="h-[260px] w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={topItensBarra}
                          margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            tickFormatter={(v) =>
                              v >= 1000 ? `${v / 1000}k` : String(v)
                            }
                          />
                          <YAxis
                            type="category"
                            dataKey="nome"
                            width={88}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                          />
                          <Tooltip content={<TooltipMoeda />} />
                          <Bar dataKey="total" name="Total" radius={[0, 6, 6, 0]}>
                            {topItensBarra.map((_, i) => (
                              <Cell
                                key={i}
                                fill={CORES_GRAFICO[i % CORES_GRAFICO.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </div>
          ) : null}

          {subAba === "mes" ? (
            <div className="space-y-4">
              <motion.div
                layout
                className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 to-white px-4 py-4 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-900/80">
                  Total no mês atual ({mesAtualRotulo})
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-950">
                  {formatarMoedaBRL(totais.totalMesAtual)}
                </p>
              </motion.div>

              <div className="rounded-2xl border border-slate-200/90 bg-white px-3 py-4 shadow-sm">
                <h3 className="mb-3 px-1 text-sm font-semibold text-slate-800">
                  Gasto por mês
                </h3>
                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={porMes}
                      margin={{ top: 8, right: 8, left: 0, bottom: 32 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="rotulo"
                        angle={-28}
                        textAnchor="end"
                        height={56}
                        tick={{ fontSize: 10, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${v / 1000}k` : String(v)
                        }
                      />
                      <Tooltip content={<TooltipMoeda />} />
                      <Bar
                        dataKey="total"
                        name="Gasto no mês"
                        fill="#4f46e5"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Mês</th>
                      <th className="px-4 py-3 font-semibold">Gasto</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Compras
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...porMes].reverse().map((m) => (
                      <tr key={m.chave} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium capitalize text-slate-800">
                          {m.rotulo}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-slate-700">
                          {formatarMoedaBRL(m.total)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                          {m.compras}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {subAba === "itens" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white px-3 py-4 shadow-sm">
                <h3 className="mb-3 px-1 text-sm font-semibold text-slate-800">
                  Ranking de gasto por produto
                </h3>
                <div className="h-[min(420px,60vh)] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={porItem.slice(0, 20).map((x) => ({
                        nome:
                          x.nomeExibicao.length > 26
                            ? `${x.nomeExibicao.slice(0, 24)}…`
                            : x.nomeExibicao,
                        total: x.total,
                      }))}
                      margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="nome"
                        width={100}
                        tick={{ fontSize: 10, fill: "#64748b" }}
                      />
                      <Tooltip content={<TooltipMoeda />} />
                      <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                        {porItem.slice(0, 20).map((_, i) => (
                          <Cell
                            key={i}
                            fill={CORES_GRAFICO[i % CORES_GRAFICO.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Item</th>
                      <th className="px-4 py-3 font-semibold">Total gasto</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Vezes
                      </th>
                      <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
                        Média
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {porItem.map((row) => {
                      const media =
                        row.ocorrencias > 0
                          ? row.total / row.ocorrencias
                          : 0;
                      return (
                        <tr key={row.nomeExibicao} className="hover:bg-slate-50/80">
                          <td className="max-w-[10rem] truncate px-4 py-2.5 font-medium text-slate-800 sm:max-w-none">
                            {row.nomeExibicao}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums text-slate-700">
                            {formatarMoedaBRL(row.total)}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                            {row.ocorrencias}
                          </td>
                          <td className="hidden px-4 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell">
                            {formatarMoedaBRL(Math.round(media * 100) / 100)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {subAba === "historico" ? (
            <ul className="space-y-3">
              {comprasFinalizadas.map((compra) => {
                const ehSimples = compra.tipoLista === "simples";
                return (
                  <motion.li
                    key={compra.id}
                    layout
                    initial={false}
                    className={[
                      "overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm",
                      ehSimples
                        ? "border-amber-200/80"
                        : "border-white/60",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "border-b px-4 py-2",
                        ehSimples
                          ? "border-amber-100 bg-amber-50/90"
                          : "border-slate-100 bg-slate-50/80",
                      ].join(" ")}
                    >
                      <p className="text-xs font-medium text-slate-500">
                        {fmtData(compra.finalizadaEm)}
                      </p>
                      {ehSimples ? (
                        <p className="mt-0.5 text-sm font-semibold text-amber-900">
                          Lista simples — sem valores em reais
                        </p>
                      ) : (
                        <p className="text-lg font-bold tabular-nums text-blue-950">
                          {formatarMoedaBRL(compra.total)}
                        </p>
                      )}
                    </div>
                    <ul className="divide-y divide-slate-100 px-4 py-2">
                      {compra.itens.map((linha, idx) => (
                        <li
                          key={`${compra.id}-${idx}-${linha.nome}`}
                          className="flex items-center justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0"
                        >
                          <span className="font-medium text-slate-800">
                            {linha.nome}
                          </span>
                          {!ehSimples ? (
                            <span className="shrink-0 tabular-nums text-slate-600">
                              {linha.preco != null
                                ? formatarMoedaBRL(linha.preco)
                                : "—"}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </motion.li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}

function KpiCard({
  titulo,
  valor,
  subtitulo,
  destaque,
}: {
  titulo: string;
  valor: string;
  subtitulo: string;
  destaque?: boolean;
}) {
  return (
    <motion.div
      layout
      className={[
        "rounded-2xl border px-3 py-3 shadow-sm",
        destaque
          ? "border-indigo-300/90 bg-gradient-to-br from-indigo-50 to-white"
          : "border-slate-200/90 bg-white",
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <p
        className={[
          "mt-1 truncate text-lg font-bold tabular-nums leading-tight sm:text-xl",
          destaque ? "text-indigo-950" : "text-slate-900",
        ].join(" ")}
      >
        {valor}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">{subtitulo}</p>
    </motion.div>
  );
}

export default AbaBalanço;
