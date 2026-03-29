interface RibbonRate {
  product: string;
  maxLoan: number;
  maxLVR: number;
  oo_pi: number | null;
  oo_io: number | null;
  inv_pi: number | null;
  inv_io: number | null;
}

const RIBBON_RATES: RibbonRate[] = [
  { product: 'HomeStart No Clawback', maxLoan: 750000, maxLVR: 65, oo_pi: 5.54, oo_io: 5.94, inv_pi: 5.79, inv_io: 6.04 },
  { product: 'HomeStart No Clawback', maxLoan: 1000000, maxLVR: 80, oo_pi: 5.74, oo_io: 6.14, inv_pi: 5.99, inv_io: 6.24 },
  { product: 'HomeStart No Clawback', maxLoan: 1250000, maxLVR: 80, oo_pi: 5.84, oo_io: 6.24, inv_pi: 6.09, inv_io: 6.34 },
  { product: 'HomeStart No Clawback', maxLoan: 2000000, maxLVR: 80, oo_pi: 5.99, oo_io: 6.39, inv_pi: 6.24, inv_io: 6.49 },
  { product: 'HomeStart No Clawback', maxLoan: 1000000, maxLVR: 95, oo_pi: 6.24, oo_io: null, inv_pi: 6.49, inv_io: 6.74 },
  { product: 'HomeStart', maxLoan: 750000, maxLVR: 65, oo_pi: 5.97, oo_io: 6.37, inv_pi: 6.22, inv_io: 6.47 },
  { product: 'HomeStart', maxLoan: 1000000, maxLVR: 80, oo_pi: 6.17, oo_io: 6.57, inv_pi: 6.42, inv_io: 6.67 },
  { product: 'HomeStart', maxLoan: 1250000, maxLVR: 80, oo_pi: 6.27, oo_io: 6.67, inv_pi: 6.52, inv_io: 6.77 },
  { product: 'HomeStart', maxLoan: 2000000, maxLVR: 80, oo_pi: 6.42, oo_io: 6.82, inv_pi: 6.67, inv_io: 6.92 },
  { product: 'HomeStart', maxLoan: 1000000, maxLVR: 95, oo_pi: 6.67, oo_io: null, inv_pi: 6.92, inv_io: 7.17 },
  { product: 'HomeFlex', maxLoan: 2500000, maxLVR: 65, oo_pi: 6.04, oo_io: 6.24, inv_pi: 6.24, inv_io: 6.44 },
  { product: 'HomeFlex', maxLoan: 2000000, maxLVR: 70, oo_pi: 6.24, oo_io: 6.44, inv_pi: 6.34, inv_io: 6.54 },
  { product: 'HomeFlex', maxLoan: 1750000, maxLVR: 80, oo_pi: 6.34, oo_io: 6.54, inv_pi: 6.44, inv_io: 6.64 },
  { product: 'HomeFlex', maxLoan: 1250000, maxLVR: 90, oo_pi: 6.74, oo_io: 6.94, inv_pi: 6.94, inv_io: 7.14 },
];

export interface BestRateResult {
  rate: number;
  product: string;
}

export function getBestRate(
  loanAmount: number,
  lvr: number,
  isInvestment: boolean,
  isInterestOnly: boolean
): BestRateResult | null {
  const rateKey = isInvestment
    ? (isInterestOnly ? 'inv_io' : 'inv_pi')
    : (isInterestOnly ? 'oo_io' : 'oo_pi');

  const eligibleRates = RIBBON_RATES.filter((entry) => {
    const rate = entry[rateKey as keyof RibbonRate];
    return (
      loanAmount <= entry.maxLoan &&
      lvr <= entry.maxLVR &&
      rate !== null
    );
  });

  if (eligibleRates.length === 0) {
    return null;
  }

  const bestEntry = eligibleRates.reduce((best, current) => {
    const bestRate = best[rateKey as keyof RibbonRate] as number;
    const currentRate = current[rateKey as keyof RibbonRate] as number;
    return currentRate < bestRate ? current : best;
  });

  return {
    rate: bestEntry[rateKey as keyof RibbonRate] as number,
    product: bestEntry.product,
  };
}

export function calculateRepayments(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number
): number {
  if (loanAmount <= 0 || annualRate <= 0 || loanTermYears <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment;
}
