import { describe, expect, it } from 'vitest';
import { applyChange, chainChanges, percentChange, percentOf, percentageOfWhole } from '../percentage';
import { sanitizeParams } from '../sanitizeParams';
import { chainSummary, formatMoney, formatMoneyDelta, formatPct, formatSignedPct, formatValue, moneyChange, round2 } from '../format';
import { DEFAULT_PARAMS, chainPercents } from '../../defaults';
import { EXAMPLE } from '../../example';
import { PERCENTAGE_FAQ } from '../../faq';

// O Intl separa "R$" do número com espaço não separável; o texto escrito usa espaço comum.
const n = (text: string) => text.replace(/ /g, ' ');

describe('contas de porcentagem', () => {
  it('quanto é X% de Y', () => {
    expect(percentOf(15, 200)).toBe(30);
    expect(percentOf(0, 200)).toBe(0);
    expect(percentOf(150, 80)).toBe(120);
  });

  it('X é quantos por cento de Y', () => {
    expect(percentageOfWhole(30, 200)).toBe(15);
    expect(percentageOfWhole(300, 200)).toBe(150);
    expect(percentageOfWhole(30, 0)).toBeNull(); // nada de "Infinity%"
  });

  it('aumento e desconto', () => {
    expect(applyChange(150, 10)).toBeCloseTo(165, 10);
    expect(applyChange(150, -10)).toBeCloseTo(135, 10);
    expect(applyChange(150, -100)).toBe(0);
  });

  it('variação percentual: ida e volta não são simétricas', () => {
    expect(percentChange(80, 100)).toBeCloseTo(25, 10);
    expect(percentChange(100, 80)).toBeCloseTo(-20, 10);
    expect(percentChange(0, 100)).toBeNull();
    // Base negativa: sair de −50 para 0 é melhorar 100%, não piorar.
    expect(percentChange(-50, 0)).toBeCloseTo(100, 10);
  });

  it('a questão viral: R$ 2.000 com +10% e depois −10% dá R$ 1.980 (−1%)', () => {
    const result = chainChanges(2000, [10, -10]);
    expect(result.steps.map((s) => Math.round(s.value * 100) / 100)).toEqual([2200, 1980]);
    expect(result.final).toBeCloseTo(1980, 10);
    expect(result.totalPercent).toBeCloseTo(-1, 10);
    // A ordem não importa.
    expect(chainChanges(2000, [-10, 10]).final).toBeCloseTo(1980, 10);
  });

  it('o aumento de 11,11% desfaz o desconto de 10%', () => {
    expect(chainChanges(2000, [-10, (1 / 0.9 - 1) * 100]).final).toBeCloseTo(2000, 10);
  });

  it('sem etapas, o valor não muda', () => {
    expect(chainChanges(500, [])).toEqual({ steps: [], final: 500, totalPercent: 0 });
  });
});

describe('formatação', () => {
  it('até duas casas, sem zeros sobrando', () => {
    expect(formatValue(30)).toBe('30');
    expect(formatValue(7.5)).toBe('7,5');
    expect(formatValue(1980.0000000001)).toBe('1.980');
    expect(formatValue(Infinity)).toBe('—');
  });

  it('nunca mostra "-0", e o menos é tipográfico', () => {
    expect(formatValue(-0)).toBe('0');
    expect(formatValue(-0.001)).toBe('0');
    expect(formatValue(percentOf(0, -200))).toBe('0');
    expect(formatValue(-200)).toBe('−200');
    expect(formatValue(-1234.5)).toBe('−1.234,5');
  });

  it('arredonda simétrico: o negativo espelha o positivo', () => {
    expect(formatValue(percentOf(12.5, 1))).toBe('0,13');
    expect(formatValue(percentOf(12.5, -1))).toBe('−0,13');
    expect(formatSignedPct(-0.125)).toBe('−0,13%');
  });

  it('diferença em reais: sinal só quando há diferença', () => {
    expect(n(formatMoneyDelta(15))).toBe('+R$ 15,00');
    expect(n(formatMoneyDelta(-15))).toBe('−R$ 15,00');
    expect(n(formatMoneyDelta(0))).toBe('R$ 0,00');
    expect(n(formatMoneyDelta(-0))).toBe('R$ 0,00');
    expect(n(formatMoneyDelta(-0.004))).toBe('R$ 0,00');
  });

  it('resumo dos sucessivos: o total aparece igual nas duas metades da frase', () => {
    // Desconto de 75% e depois de 12,5%: −78,125%, que arredonda para −78,13% nos dois lugares.
    const total = chainChanges(1000, [-75, -12.5]).totalPercent;
    expect(chainSummary(total)).toBe('Variação total de −78,13%: o mesmo que um único desconto de 78,13%.');
    expect(chainSummary(chainChanges(2000, [10, -10]).totalPercent)).toBe(
      'Variação total de −1%: o mesmo que um único desconto de 1%.',
    );
    expect(chainSummary(chainChanges(100, [10, 10]).totalPercent)).toBe(
      'Variação total de +21%: o mesmo que um único aumento de 21%.',
    );
    expect(chainSummary(0.001)).toBe('Variação total de 0%: as etapas se anulam.');
    expect(chainSummary(null)).toBe('Com valor inicial zero, não existe variação percentual.');
    // Para qualquer total, o número com sinal e o número sem sinal são o mesmo.
    // Passo inteiro (i / 200): acerta os meios de centavo exatos, sem erro acumulado.
    for (let i = -20000; i <= 20000; i++) {
      const x = i / 200;
      const signed = formatSignedPct(x);
      if (signed !== '0%') expect(signed.slice(1)).toBe(formatPct(Math.abs(x)));
    }
  });

  it('round2 arredonda o meio centavo decimal, apesar do ponto flutuante', () => {
    expect(round2(1.005)).toBe(1.01); // 1,005 × 100 = 100,4999… em binário
    expect(round2(-1.005)).toBe(-1.01);
    expect(round2(114.885)).toBe(114.89);
    expect(round2(-0.004)).toBe(0);
    expect(n(formatMoney(1.005))).toBe('R$ 1,01');
  });

  it('aumento e desconto: valor ± diferença bate com o total, centavo a centavo', () => {
    const cases: [number, number, string, string, string][] = [
      [99.9, 15, '14,99', '114,89', '84,91'],
      [19.9, 25, '4,98', '24,88', '14,92'],
      [10.01, 50, '5,01', '15,02', '5,00'],
      [1000.01, 50, '500,01', '1.500,02', '500,00'],
      [2.01, 50, '1,01', '3,02', '1,00'],
    ];
    for (const [value, percent, amount, up, down] of cases) {
      const m = moneyChange(value, percent);
      expect([formatValue(m.amount), formatMoney(m.increased), formatMoney(m.discounted)].map(n)).toEqual([
        amount.replace(/,00$/, '').replace(/(,\d)0$/, '$1'),
        `R$ ${up}`,
        `R$ ${down}`,
      ]);
    }
    // Varredura: R$ 0,01 a R$ 500,00 (passo de 7 centavos) × 1% a 100%.
    const broken: string[] = [];
    for (let cents = 1; cents <= 50000; cents += 7) {
      for (let percent = 1; percent <= 100; percent++) {
        const { amount, increased, discounted } = moneyChange(cents / 100, percent);
        const diff = Math.round(amount * 100);
        if (Math.round(increased * 100) !== cents + diff || Math.round(discounted * 100) !== cents - diff) {
          broken.push(`${cents / 100} × ${percent}%`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('variação com sinal, sem "−0%"', () => {
    expect(formatSignedPct(25)).toBe('+25%');
    expect(formatSignedPct(-1)).toBe('−1%');
    expect(formatSignedPct(-0.0001)).toBe('0%');
  });
});

describe('sanitizeParams', () => {
  it('limita etapas a 1–5, inteiras', () => {
    expect(sanitizeParams(DEFAULT_PARAMS, { chainCount: 9 }).chainCount).toBe(5);
    expect(sanitizeParams(DEFAULT_PARAMS, { chainCount: 0 }).chainCount).toBe(1);
    expect(sanitizeParams(DEFAULT_PARAMS, { chainCount: 2.6 }).chainCount).toBe(3);
  });

  it('desconto de etapa não passa de 100%', () => {
    expect(sanitizeParams(DEFAULT_PARAMS, { chainStep1: -250 }).chainStep1).toBe(-100);
  });

  it('valores em R$ (aumento/desconto e sucessivos) não ficam negativos', () => {
    const out = sanitizeParams(DEFAULT_PARAMS, { changeValue: -150, chainStart: -2000, fromValue: -50 });
    expect(out.changeValue).toBe(0);
    expect(out.chainStart).toBe(0);
    expect(out.fromValue).toBe(-50); // a variação aceita negativos
  });

  it('ignora valores não finitos', () => {
    expect(sanitizeParams(DEFAULT_PARAMS, { ofValue: NaN, toValue: Infinity })).toEqual(DEFAULT_PARAMS);
  });

  it('só as etapas em uso entram na conta', () => {
    const params = sanitizeParams(DEFAULT_PARAMS, { chainStep3: 50 });
    expect(chainPercents(params)).toEqual([10, -10]);
    expect(chainPercents({ ...params, chainCount: 3 })).toEqual([10, -10, 50]);
  });
});

describe('conteúdo da página', () => {
  it('a questão viral do FAQ bate com a conta', () => {
    expect(n(EXAMPLE.viral.final)).toBe('R$ 1.980,00');
    expect(EXAMPLE.viral.total).toBe('−1%');
    expect(EXAMPLE.viral.recovery).toBe('11,11%');
    // A pergunta é escrita por extenso (é o que as pessoas buscam): tem que casar com o exemplo.
    const question = PERCENTAGE_FAQ.find((q) => q.question.includes('volta ao valor inicial'))!;
    expect(question.question).toContain(`aumento de ${EXAMPLE.viral.up}`);
    expect(question.question).toContain(`desconto de ${EXAMPLE.viral.down}`);
    expect(n(question.answer.join(' '))).toContain('R$ 1.980,00');
  });

  it('exemplos do FAQ', () => {
    expect(EXAMPLE.of.result).toBe('30');
    expect(EXAMPLE.whole.result).toBe('15%');
    expect(n(EXAMPLE.change.discounted)).toBe('R$ 135,00');
    expect(EXAMPLE.variation.up).toBe('+25%');
    expect(EXAMPLE.variation.down).toBe('−20%');
  });
});
