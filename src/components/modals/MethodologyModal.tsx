import React from 'react';
import { X, BookOpen, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="methodology-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="methodology-modal-content"
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-[#141824] to-[#0f121a] border border-[#263044] p-6 sm:p-8 shadow-2xl text-white"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Metodologia & Fórmulas Financeiras
            </h3>
            <p className="text-xs text-slate-400">
              Transparência matemática de cada indicador exibido no simulador.
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* 1. Juros Compostos Mês a Mês */}
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-[#1f2638] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Calculator className="w-4 h-4 text-emerald-400" />
              1. Conversão de Taxa Anual para Mensal Efetiva
            </div>
            <p className="text-slate-400 text-xs">
              No mercado financeiro brasileiro, a taxa mensal equivalente a uma taxa anual é calculada pela fórmula de equivalência de juros compostos:
            </p>
            <div className="p-2.5 rounded-lg bg-[#141824] font-mono text-emerald-400 text-xs">
              i_mensal = (1 + i_anual)^(1/12) - 1
            </div>
            <p className="text-[11px] text-slate-400">
              Isso garante precisão milimétrica, evitando a distorção da divisão linear (i_anual / 12) que subestima os rendimentos.
            </p>
          </div>

          {/* 2. Reajuste Anual dos Aportes */}
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-[#1f2638] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sparkles className="w-4 h-4 text-blue-400" />
              2. Reajuste Anual do Aporte (Crescimento Real)
            </div>
            <p className="text-slate-400 text-xs">
              A cada 12 meses decorridos, o valor do aporte mensal é reajustado pelo percentual configurado pelo usuário:
            </p>
            <div className="p-2.5 rounded-lg bg-[#141824] font-mono text-blue-400 text-xs">
              Aporte(ano k) = Aporte_inicial × (1 + taxa_reajuste)^(k - 1)
            </div>
            <p className="text-[11px] text-slate-400">
              Isso simula o crescimento natural da capacidade de poupança ao longo da carreira.
            </p>
          </div>

          {/* 3. Poder de Compra Real (Inflação Descontada) */}
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-[#1f2638] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              3. Poder de Compra Real (Deflação pelo IPCA)
            </div>
            <p className="text-slate-400 text-xs">
              O montante futuro é deflacionado para o poder de compra da data presente:
            </p>
            <div className="p-2.5 rounded-lg bg-[#141824] font-mono text-amber-300 text-xs">
              Valor_Real = Saldo_Futuro / (1 + inflacao_anual)^anos
            </div>
          </div>

          {/* 4. Renda Passiva Mensal Líquida */}
          <div className="p-4 rounded-xl bg-[#0a0d14] border border-[#1f2638] space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Calculator className="w-4 h-4 text-teal-400" />
              4. Renda Passiva Mensal Líquida
            </div>
            <p className="text-slate-400 text-xs">
              Calcula quanto o patrimônio acumulado renderia mensalmente, já descontando 15% de Imposto de Renda (regra geral de longo prazo):
            </p>
            <div className="p-2.5 rounded-lg bg-[#141824] font-mono text-teal-300 text-xs">
              Renda_Liquida_Mensal = (Patrimonio_Final × i_mensal) × (1 - 0.15)
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1c2230] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1d2333] hover:bg-[#273044] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
