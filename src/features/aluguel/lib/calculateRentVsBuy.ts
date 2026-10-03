import type { RentVsBuyParams, RentVsBuySummary, RentVsBuyYear } from '../../../types';
import { calculateFinancing } from '../../financiamento/lib/calculateFinancing';
import { DAYS_PER_MONTH, LONG_TERM_TAX_RATE, regressiveTaxRate } from '../../investimentos/lib/taxes';
import { monthlyEquivalentRate } from '../../../shared/lib/format';

/** Um aporte numa carteira: o mês em que entrou e quanto. O IR depende do prazo de cada um. */
interface Lot {
  month: number;
  amount: number;
}

/** Idade, em meses, a partir da qual um aporte paga a alíquota mínima (15% depois de 720 dias). */
const MATURE_MONTHS = (() => {
  let months = 0;
  while (regressiveTaxRate(months * DAYS_PER_MONTH) > LONG_TERM_TAX_RATE) months++;
  return months;
})();

/**
 * Carteira com aportes mensais e IR regressivo por aporte.
 *
 * Reavaliar todos os aportes a cada fim de ano custava O(n²) e pesava na busca da
 * valorização de equilíbrio, que roda o motor várias vezes. Depois de 720 dias todo
 * aporte paga a mesma alíquota, então os antigos entram numa soma corrente e só os
 * recentes (no máximo 24 meses) são avaliados um a um.
 */
class Portfolio {
  private gross = 0;
  private principal = 0;
  private recent: Lot[] = [];

  constructor(private readonly monthlyReturn: number) {}

  /** Rende um mês. Chamar antes do aporte do mês. */
  grow() {
    this.gross *= 1 + this.monthlyReturn;
  }

  deposit(month: number, amount: number) {
    this.gross += amount;
    this.principal += amount;
    this.recent.push({ month, amount });
  }

  /** Saldo líquido de IR no mês `t`, como num resgate total naquele mês. */
  net(t: number, taxExempt: boolean): number {
    if (taxExempt) return this.gross;
    while (this.recent.length > 0 && t - this.recent[0].month >= MATURE_MONTHS) this.recent.shift();

    let recentGross = 0;
    let recentPrincipal = 0;
    let tax = 0;
    for (const lot of this.recent) {
      const value = lot.amount * Math.pow(1 + this.monthlyReturn, t - lot.month);
      recentGross += value;
      recentPrincipal += lot.amount;
      tax += Math.max(0, value - lot.amount) * (regressiveTaxRate((t - lot.month) * DAYS_PER_MONTH) / 100);
    }
    const matureGain = this.gross - recentGross - (this.principal - recentPrincipal);
    tax += Math.max(0, matureGain) * (LONG_TERM_TAX_RATE / 100);
    return this.gross - tax;
  }
}

/**
 * Alugar e investir a diferença, ou comprar financiado?
 *
 * Os dois lados partem do mesmo dinheiro e gastam o mesmo por mês:
 * - No mês 0, quem compra paga a entrada e os custos de aquisição (ITBI, escritura);
 *   quem aluga investe esse mesmo valor.
 * - Todo mês, cada um tem o mesmo orçamento: o maior entre o que a compra custa
 *   (parcela + manutenção) e o aluguel. Quem gastou menos investe a diferença. Depois
 *   de quitado o imóvel, quem comprou passa a investir o equivalente ao aluguel.
 *
 * Patrimônio no fim de cada ano:
 * - comprando: imóvel valorizado − saldo devedor + carteira líquida de IR;
 * - alugando: carteira líquida de IR.
 *
 * O IR segue a tabela regressiva por aporte, como num resgate total naquele mês. Não
 * entram custos de venda do imóvel (corretagem) nem IR sobre ganho de capital dele.
 */
export function calculateRentVsBuy(params: RentVsBuyParams): RentVsBuySummary {
  const months = Math.max(1, Math.round(params.years)) * 12;
  const investRate = monthlyEquivalentRate(params.investmentReturn);
  const appreciationRate = monthlyEquivalentRate(params.propertyAppreciation);
  const inflationRate = monthlyEquivalentRate(params.inflation);

  const downPayment = Math.min(params.downPayment, params.propertyValue);
  const financing = calculateFinancing({
    propertyValue: params.propertyValue,
    downPayment,
    annualInterestRate: params.financingRate,
    termMonths: params.termMonths,
    amortizationSystem: params.amortizationSystem,
    extraMonthlyAmortization: 0,
  });

  const initialOutlay = downPayment + params.propertyValue * (params.acquisitionCostRate / 100);
  const buyer = new Portfolio(investRate);
  const renter = new Portfolio(investRate);
  renter.deposit(0, initialOutlay);
  const yearly: RentVsBuyYear[] = [];

  let installment = 0;
  let rent = params.monthlyRent;
  let propertyValue = params.propertyValue;

  for (let m = 1; m <= months; m++) {
    // Reajuste no início de cada novo ano de contrato.
    if (m > 1 && (m - 1) % 12 === 0) rent *= 1 + params.rentAdjustment / 100;

    const row = financing.schedule[m - 1];
    installment = row ? row.payment + row.extraAmortization : 0;
    propertyValue *= 1 + appreciationRate;
    const maintenance = propertyValue * (params.maintenanceRate / 100 / 12);

    const buyCost = installment + maintenance;
    const budget = Math.max(buyCost, rent);
    buyer.grow();
    renter.grow();
    if (budget - buyCost > 0) buyer.deposit(m, budget - buyCost);
    if (budget - rent > 0) renter.deposit(m, budget - rent);

    if (m % 12 === 0) {
      const outstanding = row ? row.outstandingBalance : 0;
      const buyNominal = propertyValue - outstanding + buyer.net(m, params.taxExempt);
      const rentNominal = renter.net(m, params.taxExempt);
      const deflator = Math.pow(1 + inflationRate, m);
      yearly.push({
        year: m / 12,
        buyNominal,
        rentNominal,
        buyReal: buyNominal / deflator,
        rentReal: rentNominal / deflator,
        propertyValue,
        outstanding,
        monthlyRent: rent,
        monthlyInstallment: installment,
      });
    }
  }

  const last = yearly[yearly.length - 1];
  const diff = last.buyReal - last.rentReal;
  // Empate: diferença abaixo de 0,5% do maior patrimônio, que é ruído das premissas.
  const winner = Math.abs(diff) < 0.005 * Math.max(Math.abs(last.buyReal), Math.abs(last.rentReal), 1)
    ? 'tie'
    : diff > 0
      ? 'buy'
      : 'rent';

  let buyAheadFromYear: number | null = null;
  for (let i = yearly.length - 1; i >= 0 && yearly[i].buyNominal >= yearly[i].rentNominal; i--) {
    buyAheadFromYear = yearly[i].year;
  }

  return {
    initialOutlay,
    financed: financing.totalFinanced,
    firstInstallment: financing.firstInstallment,
    totalInterest: financing.totalInterestPaid,
    winner,
    finalBuyReal: last.buyReal,
    finalRentReal: last.rentReal,
    differenceReal: Math.abs(diff),
    buyAheadFromYear,
    yearly,
  };
}

/** Faixa em que a valorização de equilíbrio é procurada (a mesma que o formulário aceita). */
export const APPRECIATION_SEARCH = { min: -10, max: 30 } as const;

/**
 * Valorização anual do imóvel a partir da qual comprar empata com alugar no fim do
 * horizonte, em % a.a. Todo o resto das premissas fica como está.
 *
 * O patrimônio de quem compra cresce com a valorização e o de quem aluga não depende
 * dela, então a diferença é monótona e a busca binária basta. Doze passos sobre 40
 * pontos percentuais dão precisão de 0,01 p.p.: a tela mostra uma casa decimal.
 *
 * Devolve `'always'` se comprar vence mesmo com o imóvel perdendo 10% ao ano, e
 * `'never'` se não vence nem com 30% ao ano.
 */
export function breakEvenAppreciation(params: RentVsBuyParams): number | 'always' | 'never' {
  const buyAhead = (appreciation: number) => {
    const r = calculateRentVsBuy({ ...params, propertyAppreciation: appreciation });
    return r.finalBuyReal >= r.finalRentReal;
  };
  let lo: number = APPRECIATION_SEARCH.min;
  let hi: number = APPRECIATION_SEARCH.max;
  if (buyAhead(lo)) return 'always';
  if (!buyAhead(hi)) return 'never';
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (buyAhead(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}
