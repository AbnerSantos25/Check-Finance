import React from 'react';
import { Calculator } from 'lucide-react';
import { COMPOUND_TABLE, EXAMPLE, SIMPLE_VS_COMPOUND } from '../example';

interface LearnCompoundInterestProps {
  /** Preenche a calculadora com o exemplo resolvido (R$ 1.000 a 1% ao mês por 12 meses). */
  onTryExample: () => void;
}

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="my-3 px-4 py-3 rounded-xl bg-bg-deep border border-line font-mono text-sm sm:text-base text-white text-center overflow-x-auto">
    {children}
  </p>
);

const TH = 'py-2.5 px-3 text-right font-semibold';
const TD = 'py-2.5 px-3 text-right font-mono';

/**
 * Conteúdo educativo para as buscas sobre juros compostos: fórmula, exemplo
 * resolvido, juros simples × compostos e tabela. Texto estático pré-renderizado;
 * os números saem de `example.ts`.
 */
export const LearnCompoundInterest: React.FC<LearnCompoundInterestProps> = ({ onTryExample }) => (
  <section aria-labelledby="formula-juros-compostos" className="mt-12 pt-8 border-t border-line-soft space-y-10">
    <div>
      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Aprenda a calcular</div>
      <h2 id="formula-juros-compostos" className="text-xl font-extrabold text-white">
        Fórmula dos juros compostos
      </h2>
      <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        <p>
          Nos juros compostos, os juros de cada período entram no saldo e passam a render também: são juros sobre
          juros. A fórmula do montante é:
        </p>
        <Formula>M = C × (1 + i)ⁿ</Formula>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-slate-200">M</strong>: montante, o valor final;
          </li>
          <li>
            <strong className="text-slate-200">C</strong>: capital inicial;
          </li>
          <li>
            <strong className="text-slate-200">i</strong>: taxa de juros por período, em decimal (1% = 0,01);
          </li>
          <li>
            <strong className="text-slate-200">n</strong>: número de períodos, na mesma unidade da taxa (taxa ao mês,
            prazo em meses).
          </li>
        </ul>
        <p>
          Os juros ganhos são o montante menos o capital: <span className="font-mono text-slate-200">J = M − C</span>.
        </p>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-extrabold text-white">Como calcular juros compostos: exemplo</h2>
      <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        <p>
          {EXAMPLE.capital} aplicados a {EXAMPLE.rate} ao mês por {EXAMPLE.months} meses:
        </p>
        <Formula>
          M = 1.000 × (1 + 0,01)¹² = 1.000 × {EXAMPLE.factor} = {EXAMPLE.amount}
        </Formula>
        <p>
          São <strong className="text-slate-200">{EXAMPLE.interest}</strong> de juros. Com juros simples, o mesmo
          dinheiro chegaria a {EXAMPLE.simpleAmount}. Repare também que {EXAMPLE.rate} ao mês equivale a{' '}
          <strong className="text-slate-200">{EXAMPLE.annualEquivalent} ao ano</strong>, e não a 12%: a taxa mensal
          também rende sobre si mesma.
        </p>
        <p>
          Com aportes mensais iguais, soma-se o valor futuro de cada aporte (feito no fim do mês):
        </p>
        <Formula>M = C × (1 + i)ⁿ + A × [(1 + i)ⁿ − 1] ÷ i</Formula>
        <p>
          No mesmo exemplo, aportando {EXAMPLE.deposit} por mês, o montante chega a{' '}
          <strong className="text-slate-200">{EXAMPLE.withDeposits}</strong>.
        </p>
        <button
          type="button"
          onClick={onTryExample}
          className="inline-flex items-center gap-2 tap-target px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
        >
          <Calculator className="w-4 h-4" aria-hidden="true" />
          Fazer esta conta na calculadora
        </button>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-extrabold text-white">Juros simples x juros compostos</h2>
      <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        <p>
          Nos <strong className="text-slate-200">juros simples</strong>, a taxa incide só sobre o capital inicial:{' '}
          <span className="font-mono text-slate-200">M = C × (1 + i × n)</span>. O crescimento é uma reta. Nos{' '}
          <strong className="text-slate-200">juros compostos</strong>, incide sobre o saldo acumulado, e o
          crescimento acelera com o tempo. Veja R$ 10.000,00 a 1% ao mês:
        </p>
      </div>
      <div className="mt-4 overflow-x-auto max-w-3xl">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-bg border-b border-line text-slate-300">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-left font-semibold">Prazo</th>
              <th scope="col" className={TH}>Juros simples</th>
              <th scope="col" className={TH}>Juros compostos</th>
              <th scope="col" className={TH}>Diferença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2 text-slate-300">
            {SIMPLE_VS_COMPOUND.map((row) => (
              <tr key={row.period}>
                <th scope="row" className="py-2.5 px-3 text-left font-semibold text-white">{row.period}</th>
                <td className={TD}>{row.simple}</td>
                <td className={`${TD} text-emerald-400`}>{row.compound}</td>
                <td className={TD}>{row.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-extrabold text-white">Tabela de juros compostos</h2>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        Quanto R$ 1.000,00 se torna, sem novos aportes, para cada taxa mensal e prazo:
      </p>
      <div className="mt-4 overflow-x-auto max-w-3xl">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-bg border-b border-line text-slate-300">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-left font-semibold">Taxa</th>
              {COMPOUND_TABLE.months.map((months) => (
                <th key={months} scope="col" className={TH}>{months} meses</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2 text-slate-300">
            {COMPOUND_TABLE.rows.map((row) => (
              <tr key={row.rate}>
                <th scope="row" className="py-2.5 px-3 text-left font-semibold text-white whitespace-nowrap">{row.rate}</th>
                {row.values.map((value, index) => (
                  <td key={index} className={TD}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
