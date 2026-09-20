import React from 'react';
import { Home, Sliders, RotateCcw, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { RealEstateParams, AmortizationSystem } from '../../types';
import { formatBRL } from '../../lib/calculations';

interface RealEstateFormProps {
  params: RealEstateParams;
  onChange: (newParams: Partial<RealEstateParams>) => void;
  onReset: () => void;
  liveRates?: {
    selic: number;
    cdi: number;
  };
}

export const RealEstateForm: React.FC<RealEstateFormProps> = ({
  params,
  onChange,
  onReset,
  liveRates,
}) => {
  return (
    <div className="rounded-2xl bg-[#12151e] border border-[#1f2636] p-5 sm:p-7 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2230]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            Condições do Financiamento
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure as taxas bancárias e avalie o impacto de amortizações extras mensais.
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191e2b] hover:bg-[#22293b] border border-[#273044] text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Restaurar Padrões
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mt-8">
        
        {/* Coluna 1: Dados Básicos e Taxa */}
        <div className="space-y-8">
          {/* Valor do Imóvel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Valor do Imóvel</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-medium">R$</span>
              </div>
              <input
                type="number"
                min="0"
                step="10000"
                value={params.propertyValue}
                onChange={(e) => onChange({ propertyValue: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0b0e14] border border-[#22293b] rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Valor da Entrada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Valor da Entrada</label>
              <span className="text-xs font-mono font-medium text-sky-400">
                {((params.downPayment / params.propertyValue) * 100 || 0).toFixed(1)}% do imóvel
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-medium">R$</span>
              </div>
              <input
                type="number"
                min="0"
                max={params.propertyValue}
                step="10000"
                value={params.downPayment}
                onChange={(e) => onChange({ downPayment: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0b0e14] border border-[#22293b] rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[20, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ downPayment: params.propertyValue * (pct / 100) })}
                  className="text-[11px] px-2 py-1 rounded-lg bg-[#161a25] border border-[#222938] text-slate-400 hover:text-slate-200 transition-all"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Taxa de Juros Anual */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              Taxa de Juros Efetiva (CET) Anual
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="6"
                max="15"
                step="0.1"
                value={params.annualInterestRate}
                onChange={(e) => onChange({ annualInterestRate: Number(e.target.value) })}
                className="w-full accent-sky-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
              />
              <div className="w-24 shrink-0 relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={params.annualInterestRate}
                  onChange={(e) => onChange({ annualInterestRate: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 bg-[#0b0e14] border border-[#22293b] rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-sky-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">% a.a.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Prazo e Amortização Extra */}
        <div className="space-y-8">
          {/* Prazo */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Prazo do Financiamento</label>
              <span className="text-xs font-mono font-medium text-sky-400">
                {params.termMonths} meses ({Math.floor(params.termMonths / 12)} anos)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="60"
                max="420"
                step="12"
                value={params.termMonths}
                onChange={(e) => onChange({ termMonths: Number(e.target.value) })}
                className="w-full accent-sky-400 h-1.5 bg-[#1f2638] rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[120, 240, 360, 420].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => onChange({ termMonths: months })}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                    params.termMonths === months
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold'
                      : 'bg-[#161a25] border-[#222938] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {months / 12} Anos
                </button>
              ))}
            </div>
          </div>

          {/* Sistema de Amortização (Toggle) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              Sistema de Amortização
            </label>
            <div className="flex items-center bg-[#0b0e14] p-1 rounded-xl border border-[#22293b]">
              {(['SAC', 'PRICE'] as AmortizationSystem[]).map((sys) => (
                <button
                  key={sys}
                  onClick={() => onChange({ amortizationSystem: sys })}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                    params.amortizationSystem === sys
                      ? 'bg-[#1f2636] text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {sys === 'SAC' ? 'SAC (Decrescente)' : 'PRICE (Constante)'}
                </button>
              ))}
            </div>
          </div>

          {/* Amortização Extraordinária */}
          <div className="space-y-2 pt-2 border-t border-[#1c2230]">
            <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Amortização Extraordinária Mensal
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Simule o envio de um valor extra fixo todos os meses para abater o saldo devedor e encurtar a dívida.
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-emerald-500/60 font-medium">R$</span>
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={params.extraMonthlyAmortization}
                onChange={(e) => onChange({ extraMonthlyAmortization: Number(e.target.value) })}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0b0e14] border border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Ex: 500 para R$ 500 todo mês"
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
