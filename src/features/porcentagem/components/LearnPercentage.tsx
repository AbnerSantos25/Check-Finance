import React from 'react';
import { EXAMPLE, PERCENT_TABLE } from '../example';

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="my-3 px-4 py-3 rounded-xl bg-bg-deep border border-line font-mono text-sm sm:text-base text-white text-center overflow-x-auto">
    {children}
  </p>
);

const { of, viral, variation } = EXAMPLE;

/**
 * Conteúdo educativo para as buscas sobre porcentagem: como calcular, a questão do
 * aumento seguido de desconto e uma tabela pronta. Texto estático pré-renderizado;
 * os números saem de `example.ts`.
 */
export const LearnPercentage: React.FC = () => (
  <section aria-labelledby="como-calcular-porcentagem" className="mt-12 pt-8 border-t border-line-soft space-y-10">
    <div>
      <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Aprenda a calcular</div>
      <h2 id="como-calcular-porcentagem" className="text-xl font-extrabold text-white">
        Como calcular porcentagem
      </h2>
      <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        <p>
          Porcentagem é uma fração de 100: {of.percent} quer dizer {of.percent.replace('%', '')} partes de cada 100.
          Para calcular {of.percent} de {of.value}, há dois caminhos que dão o mesmo resultado.
        </p>
        <p>
          <strong className="text-slate-200">Pelo número decimal:</strong> divida o percentual por 100 e multiplique.
        </p>
        <Formula>
          {of.value} × {of.decimal} = {of.result}
        </Formula>
        <p>
          <strong className="text-slate-200">Pela regra de três:</strong> se {of.value} é 100%, o valor procurado está
          para {of.value} assim como {of.percent} está para 100%.
        </p>
        <Formula>
          x = {of.value} × {of.percent.replace('%', '')} ÷ 100 = {of.result}
        </Formula>
        <p>
          Para aumento, multiplique por (1 + percentual ÷ 100); para desconto, por (1 − percentual ÷ 100). A variação
          entre dois valores é (final − inicial) ÷ inicial × 100: de {variation.from} para {variation.to}, {variation.up}.
        </p>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-extrabold text-white">
        Aumento de {viral.up} e depois desconto de {viral.down}: volta ao valor inicial?
      </h2>
      <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        <p>
          Não volta. O desconto é calculado sobre o valor já aumentado, que é maior do que o inicial. Com{' '}
          {viral.start}:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Aumento de {viral.up}: {viral.start} viram <strong className="text-slate-200">{viral.afterUp}</strong>.
          </li>
          <li>
            Desconto de {viral.down} sobre {viral.afterUp}: o valor final é{' '}
            <strong className="text-slate-200">{viral.final}</strong>.
          </li>
        </ol>
        <p>
          São {viral.loss} a menos, uma variação total de <strong className="text-slate-200">{viral.total}</strong>. A
          ordem não importa: desconto primeiro e aumento depois também termina em {viral.final}. Para desfazer um
          desconto de {viral.down}, o aumento precisa ser de cerca de {viral.recovery}.
        </p>
      </div>
    </div>

    <div>
      <h2 className="text-xl font-extrabold text-white">Tabela de porcentagens</h2>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
        Quanto é cada porcentagem dos valores mais comuns:
      </p>
      <p className="sm:hidden mt-1 text-caption text-slate-400">Deslize a tabela para o lado para ver todos os valores.</p>
      <div className="mt-4 overflow-x-auto max-w-3xl">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead className="bg-bg border-b border-line text-slate-300">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-left font-semibold">
                Porcentagem
              </th>
              {PERCENT_TABLE.values.map((value) => (
                <th key={value} scope="col" className="py-2.5 px-3 text-right font-semibold">
                  de {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2 text-slate-300">
            {PERCENT_TABLE.rows.map((row) => (
              <tr key={row.percent}>
                <th scope="row" className="py-2.5 px-3 text-left font-semibold text-white">
                  {row.percent}
                </th>
                {row.results.map((result, index) => (
                  <td key={index} className="py-2.5 px-3 text-right font-mono">
                    {result}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
