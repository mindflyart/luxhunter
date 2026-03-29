export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

interface StampDutyResult {
  amount: number;
  fhbExemptionApplied: boolean;
  state: AustralianState;
}

export function calculateStampDuty(
  propertyPrice: number,
  state: AustralianState,
  isFirstHomeBuyer: boolean = false
): StampDutyResult {
  let amount = 0;
  let fhbExemptionApplied = false;

  switch (state) {
    case 'NSW':
      if (isFirstHomeBuyer) {
        if (propertyPrice <= 800000) {
          amount = 0;
          fhbExemptionApplied = true;
        } else if (propertyPrice <= 1000000) {
          const baseStampDuty = calculateNSWStampDuty(propertyPrice);
          const reduction = ((1000000 - propertyPrice) / 200000) * baseStampDuty;
          amount = Math.max(0, baseStampDuty - reduction);
          fhbExemptionApplied = true;
        } else {
          amount = calculateNSWStampDuty(propertyPrice);
        }
      } else {
        amount = calculateNSWStampDuty(propertyPrice);
      }
      break;

    case 'VIC':
      if (isFirstHomeBuyer) {
        if (propertyPrice <= 600000) {
          amount = 0;
          fhbExemptionApplied = true;
        } else if (propertyPrice <= 750000) {
          const baseStampDuty = calculateVICStampDuty(propertyPrice);
          const reduction = ((750000 - propertyPrice) / 150000) * baseStampDuty;
          amount = Math.max(0, baseStampDuty - reduction);
          fhbExemptionApplied = true;
        } else {
          amount = calculateVICStampDuty(propertyPrice);
        }
      } else {
        amount = calculateVICStampDuty(propertyPrice);
      }
      break;

    case 'QLD':
      if (isFirstHomeBuyer && propertyPrice <= 550000) {
        amount = 0;
        fhbExemptionApplied = true;
      } else {
        amount = calculateQLDStampDuty(propertyPrice);
      }
      break;

    case 'WA':
      amount = calculateWAStampDuty(propertyPrice);
      break;

    case 'SA':
      amount = calculateSAStampDuty(propertyPrice);
      break;

    case 'TAS':
      amount = calculateTASStampDuty(propertyPrice);
      break;

    case 'ACT':
      amount = calculateACTStampDuty(propertyPrice);
      break;

    case 'NT':
      amount = calculateNTStampDuty(propertyPrice);
      break;
  }

  return {
    amount: Math.round(amount),
    fhbExemptionApplied,
    state
  };
}

function calculateNSWStampDuty(price: number): number {
  if (price <= 17000) {
    return price * 0.0125;
  } else if (price <= 35000) {
    return 212 + (price - 17000) * 0.015;
  } else if (price <= 93000) {
    return 482 + (price - 35000) * 0.0175;
  } else if (price <= 351000) {
    return 1499 + (price - 93000) * 0.035;
  } else if (price <= 1168000) {
    return 10530 + (price - 351000) * 0.045;
  } else {
    return 47295 + (price - 1168000) * 0.055;
  }
}

function calculateVICStampDuty(price: number): number {
  if (price <= 25000) {
    return price * 0.014;
  } else if (price <= 130000) {
    return 350 + (price - 25000) * 0.024;
  } else if (price <= 440000) {
    return 2870 + (price - 130000) * 0.05;
  } else if (price <= 550000) {
    return 18370 + (price - 440000) * 0.06;
  } else if (price <= 960000) {
    return 24970 + (price - 550000) * 0.06;
  } else {
    return 49570 + (price - 960000) * 0.065;
  }
}

function calculateQLDStampDuty(price: number): number {
  if (price <= 5000) {
    return 0;
  } else if (price <= 75000) {
    return (price - 5000) * 0.015;
  } else if (price <= 540000) {
    return 1050 + (price - 75000) * 0.035;
  } else if (price <= 1000000) {
    return 17325 + (price - 540000) * 0.045;
  } else {
    return 38025 + (price - 1000000) * 0.0575;
  }
}

function calculateWAStampDuty(price: number): number {
  if (price <= 120000) {
    return price * 0.019;
  } else if (price <= 150000) {
    return 2280 + (price - 120000) * 0.0285;
  } else if (price <= 360000) {
    return 3135 + (price - 150000) * 0.038;
  } else if (price <= 725000) {
    return 11115 + (price - 360000) * 0.0475;
  } else {
    return 28453 + (price - 725000) * 0.0515;
  }
}

function calculateSAStampDuty(price: number): number {
  if (price <= 12000) {
    return price * 0.01;
  } else if (price <= 30000) {
    return 120 + (price - 12000) * 0.02;
  } else if (price <= 50000) {
    return 480 + (price - 30000) * 0.03;
  } else if (price <= 100000) {
    return 1080 + (price - 50000) * 0.035;
  } else if (price <= 200000) {
    return 2830 + (price - 100000) * 0.04;
  } else if (price <= 250000) {
    return 6830 + (price - 200000) * 0.0425;
  } else if (price <= 300000) {
    return 8955 + (price - 250000) * 0.0475;
  } else if (price <= 500000) {
    return 11330 + (price - 300000) * 0.05;
  } else {
    return 21330 + (price - 500000) * 0.055;
  }
}

function calculateTASStampDuty(price: number): number {
  if (price <= 3000) {
    return 50;
  } else if (price <= 25000) {
    return 50 + (price - 3000) * 0.0175;
  } else if (price <= 75000) {
    return 435 + (price - 25000) * 0.0225;
  } else if (price <= 200000) {
    return 1560 + (price - 75000) * 0.035;
  } else if (price <= 375000) {
    return 5935 + (price - 200000) * 0.04;
  } else if (price <= 725000) {
    return 12935 + (price - 375000) * 0.0425;
  } else {
    return 27810 + (price - 725000) * 0.045;
  }
}

function calculateACTStampDuty(price: number): number {
  if (price <= 200000) {
    return price * 0.006;
  } else if (price <= 300000) {
    return 1200 + (price - 200000) * 0.022;
  } else if (price <= 500000) {
    return 3400 + (price - 300000) * 0.034;
  } else if (price <= 750000) {
    return 10200 + (price - 500000) * 0.0432;
  } else if (price <= 1000000) {
    return 21000 + (price - 750000) * 0.059;
  } else {
    return 35750 + (price - 1000000) * 0.064;
  }
}

function calculateNTStampDuty(price: number): number {
  if (price <= 525000) {
    return price * 0.04;
  } else {
    return price * 0.0495;
  }
}

export function getStateName(state: AustralianState): string {
  const stateNames: Record<AustralianState, string> = {
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'WA': 'Western Australia',
    'SA': 'South Australia',
    'TAS': 'Tasmania',
    'ACT': 'Australian Capital Territory',
    'NT': 'Northern Territory'
  };
  return stateNames[state];
}

export function hasFHBExemption(state: AustralianState): boolean {
  return ['NSW', 'VIC', 'QLD'].includes(state);
}
