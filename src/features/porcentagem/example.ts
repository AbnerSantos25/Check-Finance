import { formatBRL } from '../../shared/lib/format';
import { applyChange, chainChanges, percentChange, percentOf, percentageOfWhole } from './lib/percentage';
import { formatPct, formatSignedPct, formatValue } from './lib/format';
import { DEFAULT_PARAMS as D, chainPercents } from './defaults';

/**
 * Números do conteúdo educativo e do FAQ. Saem das funções da calculadora e dos
 * exemplos que a página abre preenchidos: ao mudar um, o texto acompanha.
 */

const viral = chainChanges(D.chainStart, chainPercents(D));
const [up, down] = chainPercents(D);
/** Aumento que desfaz o desconto da questão: 1 ÷ (1 − 10%) − 1 = 11,11%. */
const recovery = (1 / (1 + down / 100) - 1) * 100;

export const EXAMPLE = {
  of: {
    percent: formatPct(D.ofPercent),
    value: formatValue(D.ofValue),
    decimal: formatValue(D.ofPercent / 100),
    result: formatValue(percentOf(D.ofPercent, D.ofValue)),
  },
  whole: {
    part: formatValue(D.partValue),
    whole: formatValue(D.wholeValue),
    result: formatPct(percentageOfWhole(D.partValue, D.wholeValue) ?? 0),
  },
  change: {
    value: formatBRL(D.changeValue),
    percent: formatPct(D.changePercent),
    increased: formatBRL(applyChange(D.changeValue, D.changePercent)),
    discounted: formatBRL(applyChange(D.changeValue, -D.changePercent)),
    discountFactor: formatValue(1 - D.changePercent / 100),
  },
  variation: {
    from: formatValue(D.fromValue),
    to: formatValue(D.toValue),
    up: formatSignedPct(percentChange(D.fromValue, D.toValue) ?? 0),
    // A volta (de 100 para 80) não é −25%: a base mudou.
    down: formatSignedPct(percentChange(D.toValue, D.fromValue) ?? 0),
  },
  viral: {
    start: formatBRL(D.chainStart),
    up: formatPct(up),
    down: formatPct(Math.abs(down)),
    afterUp: formatBRL(viral.steps[0].value),
    final: formatBRL(viral.final),
    loss: formatBRL(D.chainStart - viral.final),
    total: formatSignedPct(viral.totalPercent ?? 0),
    recovery: formatPct(recovery),
  },
};

const TABLE_PERCENTS = [5, 10, 15, 20, 25, 50];
const TABLE_VALUES = [50, 100, 200, 500, 1000, 2000];

/** Tabela de porcentagens comuns: quanto é cada percentual de cada valor. */
export const PERCENT_TABLE = {
  values: TABLE_VALUES.map(formatValue),
  rows: TABLE_PERCENTS.map((percent) => ({
    percent: formatPct(percent),
    results: TABLE_VALUES.map((value) => formatValue(percentOf(percent, value))),
  })),
};
