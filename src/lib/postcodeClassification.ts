export type LocationClassification = 'Inner City' | 'Metro' | 'Non-Metro' | 'Regional' | 'High-Risk' | 'Unacceptable';

export interface LVRLimit {
  classification: LocationClassification;
  lvr0_70: number;
  lvr70_80: number;
  lvr80_90: number | null;
  lvr90_95: number | null;
}

const POSTCODE_RANGES = {
  NSW: {
    innerCity: [2000, 2005],
    metro: [[2006, 2234], [2250, 2263], [2500, 2536]],
    nonMetro: [[2264, 2499], [2537, 2551]],
    regional: [[2300, 2249], [2552, 2899]],
  },
  VIC: {
    innerCity: [3000, 3010],
    metro: [[3011, 3211], [3335, 3341], [3750, 3810]],
    nonMetro: [[3212, 3334], [3342, 3431]],
    regional: [[3432, 3749], [3811, 3999]],
  },
  QLD: {
    innerCity: [4000, 4004],
    metro: [[4005, 4179], [4500, 4519]],
    nonMetro: [[4180, 4207], [4520, 4575]],
    regional: [[4208, 4499], [4576, 4899]],
  },
  SA: {
    innerCity: [5000, 5005],
    metro: [[5006, 5173], [5231, 5253]],
    nonMetro: [[5174, 5230], [5254, 5276]],
    regional: [[5277, 5999]],
  },
  WA: {
    innerCity: [6000, 6004],
    metro: [[6005, 6214], [6901, 6914]],
    nonMetro: [[6215, 6239], [6915, 6929]],
    regional: [[6240, 6900], [6930, 6999]],
  },
  TAS: {
    innerCity: [7000, 7003],
    metro: [[7004, 7109], [7140, 7150]],
    nonMetro: [[7110, 7139], [7151, 7199]],
    regional: [[7200, 7499]],
  },
  ACT: {
    innerCity: [2600, 2618],
    metro: [[2619, 2914]],
    nonMetro: [],
    regional: [[2915, 2999]],
  },
  NT: {
    innerCity: [800, 801],
    metro: [[802, 822]],
    nonMetro: [[823, 835]],
    regional: [[836, 899]],
  },
};

const HIGH_RISK_POSTCODES = [2540, 2541, 2830, 3995, 4860, 4871, 6714, 6720];
const UNACCEPTABLE_POSTCODES = [2899, 3999, 4880, 6725, 6760];

const LVR_LIMITS: LVRLimit[] = [
  {
    classification: 'Inner City',
    lvr0_70: 3500000,
    lvr70_80: 3500000,
    lvr80_90: 3000000,
    lvr90_95: 2000000,
  },
  {
    classification: 'Metro',
    lvr0_70: 3500000,
    lvr70_80: 3500000,
    lvr80_90: 3000000,
    lvr90_95: 2000000,
  },
  {
    classification: 'Non-Metro',
    lvr0_70: 3000000,
    lvr70_80: 2500000,
    lvr80_90: null,
    lvr90_95: null,
  },
  {
    classification: 'Regional',
    lvr0_70: 3000000,
    lvr70_80: 2500000,
    lvr80_90: null,
    lvr90_95: null,
  },
];

function isInRange(postcode: number, range: number | number[] | number[][]): boolean {
  if (typeof range === 'number') {
    return postcode === range;
  }
  if (Array.isArray(range)) {
    if (range.length === 2 && typeof range[0] === 'number' && typeof range[1] === 'number') {
      return postcode >= range[0] && postcode <= range[1];
    }
    return (range as number[][]).some(([start, end]) => postcode >= start && postcode <= end);
  }
  return false;
}

export function classifyPostcode(postcode: string, state: string): LocationClassification {
  const code = parseInt(postcode);

  if (isNaN(code)) {
    return 'Regional';
  }

  if (UNACCEPTABLE_POSTCODES.includes(code)) {
    return 'Unacceptable';
  }

  if (HIGH_RISK_POSTCODES.includes(code)) {
    return 'High-Risk';
  }

  const stateRanges = POSTCODE_RANGES[state as keyof typeof POSTCODE_RANGES];
  if (!stateRanges) {
    return 'Regional';
  }

  if (isInRange(code, stateRanges.innerCity)) {
    return 'Inner City';
  }

  if (stateRanges.metro.length && isInRange(code, stateRanges.metro)) {
    return 'Metro';
  }

  if (stateRanges.nonMetro.length && isInRange(code, stateRanges.nonMetro)) {
    return 'Non-Metro';
  }

  if (stateRanges.regional.length && isInRange(code, stateRanges.regional)) {
    return 'Regional';
  }

  return 'Regional';
}

export function getLVRLimits(classification: LocationClassification): LVRLimit | null {
  return LVR_LIMITS.find(limit => limit.classification === classification) || null;
}

export function calculateLVR(propertyValue: number, deposit: number): number {
  const loanAmount = propertyValue - deposit;
  return (loanAmount / propertyValue) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(amount);
}
