import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId } from "react";

const PASSOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Adicionar itens",
    texto:
      "Na aba Adicionar Itens, digite o nome e confirme. Enquanto escreve, aparecem sugestões com base nas compras que você já finalizou (nomes parecidos e itens que costumam ir juntos na mesma compra). Se o histórico mostrar intervalos regulares entre compras do mesmo produto, também pode aparecer o bloco Lembretes por cadência. Se for um item novo, escolha uma categoria existente ou crie uma. Você pode definir a unidade (UN ou Kg) no momento de adicionar.",
  },
  {
    titulo: "Lista do Mercado",
    texto:
      "Toque no botão azul “Lista do Mercado” (acima das abas). Na lista completa, informe preço unitário e quantidade em reais (R$); o subtotal é automático. Pode definir um orçamento desta ida em R$: a barra mostra quanto do limite o total estimado já usa e avisa ao aproximar (80%, 90%) ou ultrapassar. Só é possível marcar como comprado depois de preencher preço e quantidade. Na lista simples não há valores nem orçamento.",
  },
  {
    titulo: "Comprar Novamente",
    texto:
      "Itens marcados como comprados. Ao marcar o checkbox, o item vai para a Lista do Mercado (preço e quantidade zerados) e a linha fica opaca, mas continua nesta aba. Desmarque para tirar do mercado e voltar ao estado anterior.",
  },
  {
    titulo: "Finalizar compras",
    texto:
      "Toque em Finalizar compras para ver o resumo no modal. Ao confirmar (OK), os valores vão para o Balanço; os itens comprados saem da Lista do Mercado e permanecem em Adicionar itens e em Comprar Novamente. Cancelar só fecha o modal.",
  },
  {
    titulo: "Balanço",
    texto:
      "Na aba Balanço você acompanha o histórico das compras finalizadas, totais e gráficos por período. Pode criar várias listas por viagem (ex.: loja, feira): no topo escolha a lista ativa ou use Gerir listas. No balanço, filtre por uma lista ou veja todas em conjunto; no histórico, as finalizações aparecem agrupadas pelo nome da lista.",
  },
  {
    titulo: "Limpar e agrupar",
    texto:
      "Na aba Adicionar Itens, Limpar lista remove itens selecionados e Agrupar por tipo cria categorias para organizar vários itens de uma vez.",
  },
  {
    titulo: "Dados e privacidade",
    texto:
      "Por defeito tudo fica neste aparelho. Com Firebase configurado, nas configurações pode ligar sincronização em tempo real (mesma sala e palavra-passe em vários aparelhos) ou gerar um link só leitura: quem abrir o link vê um instantâneo das listas sem poder editar. Sem Firebase não há nuvem própria: a lista e o balanço funcionam sem internet; só o escanear código de barras precisa de rede para buscar o nome do produto. No ícone de engrenagem você pode zerar os dados locais, como se reinstalasse o app.",
  },
];

type Props = {
  aberto: boolean;
  onFechar: () => void;
};

export function ModalTutorial({ aberto, onFechar }: Props) {
  const tituloId = useId();

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto, onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [aberto]);

  return (
    <AnimatePresence>
      {aberto ? (
        <motion.div
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
            onClick={onFechar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative z-10 flex max-h-[min(85dvh,32rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-blue-900/20 sm:max-h-[min(90dvh,36rem)]"
          >
            <div className="shrink-0 border-b border-slate-100 px-5 pb-3 pt-5">
              <h2
                id={tituloId}
                className="text-lg font-bold text-blue-950"
              >
                Como usar
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Passo a passo do aplicativo — do planejamento ao balanço.
              </p>
            </div>

            <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
              {PASSOS.map((passo, i) => (
                <li key={passo.titulo} className="flex gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-800"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold text-slate-800">
                      {passo.titulo}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {passo.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-4">
              <button
                type="button"
                onClick={onFechar}
                className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white py-3 text-base font-semibold text-slate-800 transition active:scale-[0.98]"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
