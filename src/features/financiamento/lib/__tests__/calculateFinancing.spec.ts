import { describe, expect, it } from 'vitest';
import { calculateFinancing } from '../calculateFinancing';
import type { RealEstateParams } from '../../../../types';

// Cenário padrão exibido ao abrir o simulador.
const BASE: RealEstateParams = {
  propertyValue: 500000,
  downPayment: 100000,
  annualInterestRate: 9.5,
  termMonths: 360,
  amortizationSystem: 'SAC',
  extraMonthlyAmortization: 0,
};

describe('calculateFinancing — SAC padrão', () => {
  const s = calculateFinancing(BASE);

  it('fixa o resumo', () => {
    expect(s.totalFinanced).toBe(400000);
    expect(s.totalPaidOut).toBeCloseTo(948108.7757800531, 6);
    expect(s.totalInterestPaid).toBeCloseTo(548108.775780056, 6);
    expect(s.firstInstallment).toBeCloseTo(4147.724827344138, 6);
    expect(s.lastInstallment).toBeCloseTo(1119.5461492087695, 6);
    expect(s.actualTermMonths).toBe(360);
    expect(s.monthsSaved).toBe(0);
    expect(s.interestSaved).toBe(0);
  });

  it('mantém amortização constante e parcela decrescente', () => {
    expect(s.schedule).toHaveLength(360);
    expect(s.schedule[0].amortization).toBeCloseTo(1111.111111111111, 6);
    expect(s.schedule[0].interest).toBeCloseTo(3036.6137162330274, 6);
    expect(s.schedule[0].outstandingBalance).toBeCloseTo(398888.8888888889, 6);
    expect(s.schedule[359].outstandingBalance).toBe(0);
    expect(s.schedule[359].payment).toBeLessThan(s.schedule[0].payment);
  });
});

describe('calculateFinancing — PRICE', () => {
  const s = calculateFinancing({ ...BASE, amortizationSystem: 'PRICE' });

  it('fixa o resumo', () => {
    expect(s.totalPaidOut).toBeCloseTo(1170055.5439320654, 6);
    expect(s.totalInterestPaid).toBeCloseTo(770055.5439320636, 6);
    expect(s.actualTermMonths).toBe(360);
    expect(s.monthsSaved).toBe(0);
    // Sem amortização extra não há economia; o resíduo é poeira de ponto flutuante
    // entre o cálculo fechado do baseline e a soma mês a mês da simulação.
    expect(s.interestSaved).toBeCloseTo(0, 6);
  });

  it('mantém a parcela constante', () => {
    expect(s.schedule).toHaveLength(360);
    expect(s.firstInstallment).toBeCloseTo(3250.1542887001783, 6);
    expect(s.lastInstallment).toBeCloseTo(3250.154288699764, 6);
    expect(s.schedule[359].outstandingBalance).toBe(0);
  });

  it('cobra mais juros que o SAC no mesmo prazo', () => {
    expect(s.totalInterestPaid).toBeGreaterThan(calculateFinancing(BASE).totalInterestPaid);
  });
});

describe('calculateFinancing — SAC com amortização extra mensal', () => {
  const s = calculateFinancing({ ...BASE, extraMonthlyAmortization: 500 });

  it('encurta o prazo e reduz os juros', () => {
    expect(s.actualTermMonths).toBe(249);
    expect(s.monthsSaved).toBe(111);
    expect(s.interestSaved).toBeCloseTo(169630.30321163463, 6);
    expect(s.totalPaidOut).toBeCloseTo(778478.4725684193, 6);
    expect(s.totalInterestPaid).toBeCloseTo(378478.4725684214, 6);
  });

  it('soma o extra ao pagamento do mês sem alterar a parcela base', () => {
    expect(s.schedule[0].extraAmortization).toBe(500);
    expect(s.schedule[0].payment).toBeCloseTo(4647.724827344138, 6);
    // firstInstallment registra a parcela sem o extra, que é como o mercado exibe.
    expect(s.firstInstallment).toBeCloseTo(4147.724827344138, 6);
  });

  it('quita sem deixar saldo residual', () => {
    expect(s.schedule).toHaveLength(249);
    expect(s.schedule[248].outstandingBalance).toBe(0);
  });
});

describe('calculateFinancing — imóvel pago à vista', () => {
  it('retorna resumo zerado quando não há valor financiado', () => {
    const s = calculateFinancing({ ...BASE, downPayment: 500000 });
    expect(s).toEqual({
      totalFinanced: 0,
      totalPaidOut: 0,
      totalInterestPaid: 0,
      firstInstallment: 0,
      lastInstallment: 0,
      monthsSaved: 0,
      interestSaved: 0,
      actualTermMonths: 0,
      schedule: [],
    });
  });
});

describe('calculateFinancing — juros zerados', () => {
  // Sem juros, PRICE e SAC descrevem o mesmo empréstimo: a parcela é só o valor
  // financiado dividido pelo prazo. Antes, a PRICE devolvia parcela zero, o saldo
  // nunca caía e o laço parava no limite de segurança com o dobro do prazo.
  const semJuros = { ...BASE, annualInterestRate: 0 };

  it('PRICE amortiza normalmente e quita no prazo contratado', () => {
    const s = calculateFinancing({ ...semJuros, amortizationSystem: 'PRICE' });

    expect(s.actualTermMonths).toBe(360);
    expect(s.schedule).toHaveLength(360);
    expect(s.totalPaidOut).toBeCloseTo(400000, 6);
    expect(s.totalInterestPaid).toBeCloseTo(0, 6);
    expect(s.firstInstallment).toBeCloseTo(400000 / 360, 6);
    expect(s.schedule[359].outstandingBalance).toBe(0);
  });

  it('PRICE e SAC coincidem quando não há juros', () => {
    const price = calculateFinancing({ ...semJuros, amortizationSystem: 'PRICE' });
    const sac = calculateFinancing({ ...semJuros, amortizationSystem: 'SAC' });

    expect(price.totalPaidOut).toBeCloseTo(sac.totalPaidOut, 6);
    expect(price.firstInstallment).toBeCloseTo(sac.firstInstallment, 6);
    expect(price.actualTermMonths).toBe(sac.actualTermMonths);
  });

  it('a amortização extra encurta o prazo em vez de estourar o limite', () => {
    const s = calculateFinancing({
      ...semJuros,
      amortizationSystem: 'PRICE',
      extraMonthlyAmortization: 500,
    });

    expect(s.actualTermMonths).toBe(249);
    expect(s.monthsSaved).toBe(111);
    expect(s.totalPaidOut).toBeCloseTo(400000, 6);
  });
});

describe('calculateFinancing — economia residual de ponto flutuante', () => {
  // O card de economia do resumo decide o que exibir a partir deste número. Ele é a
  // diferença entre dois somatórios e não fecha em zero exato: por isso a tela usa
  // tolerância de um centavo em vez de comparar com zero.
  it('mantém a economia da PRICE sem extra abaixo de um centavo', () => {
    const s = calculateFinancing({ ...BASE, amortizationSystem: 'PRICE' });

    expect(s.monthsSaved).toBe(0);
    expect(s.interestSaved).toBeLessThan(0.01);
  });
});
