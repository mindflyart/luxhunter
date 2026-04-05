export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';
export type PropertyType = 'Established Home' | 'New Build' | 'Vacant Land';
export type BuyerType = 'First Home Buyer' | 'Owner Occupied' | 'Investor' | 'Foreign Buyer';

export interface StampDutyResult {
  amount: number;
  fhbExemptionApplied: boolean;
  state: AustralianState;
  standardDuty?: number;
  concessionAmount?: number;
  savingsAmount?: number;
  eligibilityMessage?: string;
  disclaimer?: string;
}

// --- Standard rate calculators ---

function calcQLDStandard(price: number): number {
  if (price <= 5000) return 0;
  if (price <= 75000) return ((price - 5000) / 100) * 1.5;
  if (price <= 540000) return 1050 + ((price - 75000) / 100) * 3.5;
  if (price <= 1000000) return 17325 + ((price - 540000) / 100) * 4.5;
  return 38025 + ((price - 1000000) / 100) * 5.75;
}

function calcNSWStandard(price: number): number {
  if (price <= 16000) return (price / 100) * 1.25;
  if (price <= 35000) return 200 + ((price - 16000) / 100) * 1.5;
  if (price <= 93000) return 485 + ((price - 35000) / 100) * 1.75;
  if (price <= 351000) return 1500 + ((price - 93000) / 100) * 3.5;
  if (price <= 1087000) return 10530 + ((price - 351000) / 100) * 4.5;
  if (price <= 3268000) return 43650 + ((price - 1087000) / 100) * 5.5;
  return 163700 + ((price - 3268000) / 100) * 7.0;
}

function calcVICStandard(price: number): number {
  if (price <= 25000) return price * 0.014;
  if (price <= 130000) return 350 + (price - 25000) * 0.024;
  if (price <= 960000) return 2870 + (price - 130000) * 0.06;
  if (price <= 2000000) return 55000 + (price - 960000) * 0.06;
  return price * 0.065;
}

function calcWAStandard(price: number): number {
  if (price <= 120000) return (price / 100) * 1.9;
  if (price <= 150000) return 2280 + ((price - 120000) / 100) * 2.85;
  if (price <= 360000) return 3135 + ((price - 150000) / 100) * 3.8;
  if (price <= 725000) return 11115 + ((price - 360000) / 100) * 4.75;
  return 28453 + ((price - 725000) / 100) * 5.15;
}

function calcSAStandard(price: number): number {
  if (price <= 12000) return (price / 100) * 1.0;
  if (price <= 30000) return 120 + ((price - 12000) / 100) * 2.0;
  if (price <= 50000) return 480 + ((price - 30000) / 100) * 3.0;
  if (price <= 100000) return 1080 + ((price - 50000) / 100) * 3.5;
  if (price <= 200000) return 2830 + ((price - 100000) / 100) * 4.0;
  if (price <= 250000) return 6830 + ((price - 200000) / 100) * 4.25;
  if (price <= 500000) return 8955 + ((price - 250000) / 100) * 4.75;
  return 20830 + ((price - 500000) / 100) * 5.5;
}

function calcTASStandard(price: number): number {
  if (price <= 3000) return 50;
  if (price <= 25000) return 50 + ((price - 3000) / 100) * 1.75;
  if (price <= 75000) return 435 + ((price - 25000) / 100) * 2.25;
  if (price <= 200000) return 1560 + ((price - 75000) / 100) * 3.5;
  if (price <= 375000) return 5935 + ((price - 200000) / 100) * 4.0;
  if (price <= 725000) return 12935 + ((price - 375000) / 100) * 4.25;
  return 27810 + ((price - 725000) / 100) * 4.5;
}

function calcACTStandard(price: number): number {
  if (price <= 200000) return (price / 100) * 0.6;
  if (price <= 300000) return 1200 + ((price - 200000) / 100) * 2.2;
  if (price <= 500000) return 3400 + ((price - 300000) / 100) * 3.4;
  if (price <= 750000) return 10200 + ((price - 500000) / 100) * 4.32;
  if (price <= 1000000) return 21000 + ((price - 750000) / 100) * 5.9;
  return 35750 + ((price - 1000000) / 100) * 6.4;
}

function calcNTStandard(price: number): number {
  if (price > 525000) return price * 0.0495;
  const V = price / 1000;
  return (0.06571441 * V * V + 15 * V) * 0.01;
}

// --- Main export ---

export function calculateStampDuty(
  propertyPrice: number,
  state: AustralianState,
  isFirstHomeBuyer: boolean = false,
  propertyType: PropertyType,
  buyerType?: BuyerType
): StampDutyResult {
  let amount = 0;
  let fhbExemptionApplied = false;
  let standardDuty = 0;
  let concessionAmount = 0;
  let savingsAmount = 0;
  let eligibilityMessage = '';
  const disclaimer = 'Estimates only. Rates current 2025-2026. Consult a licensed conveyancer for exact figures.';

  switch (state) {
    case 'QLD': {
      standardDuty = calcQLDStandard(propertyPrice);
      const isForeign = buyerType === 'Foreign Buyer';

      if (isFirstHomeBuyer && !isForeign) {
        if (propertyType === 'New Build') {
          // After 1 May 2025: $0 no cap for new builds
          amount = 0;
          fhbExemptionApplied = true;
          savingsAmount = standardDuty;
          eligibilityMessage = `🎉 Full exemption! QLD First Home Buyer concession (New Build) saves you $${Math.round(savingsAmount).toLocaleString()}`;
        } else if (propertyType === 'Vacant Land') {
          // $0 no cap for vacant land
          amount = 0;
          fhbExemptionApplied = true;
          savingsAmount = standardDuty;
          eligibilityMessage = `🎉 Full exemption! QLD First Home Buyer concession (Vacant Land) saves you $${Math.round(savingsAmount).toLocaleString()}`;
        } else {
          // Established Home
          if (propertyPrice <= 700000) {
            amount = 0;
            fhbExemptionApplied = true;
            savingsAmount = standardDuty;
            eligibilityMessage = `🎉 Full exemption! QLD First Home Buyer concession saves you $${Math.round(savingsAmount).toLocaleString()}`;
          } else if (propertyPrice <= 800000) {
            // Partial concession: sliding scale
            const concessionFraction = (800000 - propertyPrice) / 100000;
            concessionAmount = standardDuty * concessionFraction;
            amount = standardDuty - concessionAmount;
            fhbExemptionApplied = true;
            savingsAmount = concessionAmount;
            eligibilityMessage = `✅ Partial QLD First Home Buyer concession applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
          } else {
            amount = standardDuty;
            eligibilityMessage = 'Standard rates apply (property over $800,000 threshold)';
          }
        }
      } else {
        amount = standardDuty;
        if (isForeign) {
          const afad = propertyPrice * 0.08;
          amount = standardDuty + afad;
          eligibilityMessage = `Foreign buyer: standard duty + 8% AFAD ($${Math.round(afad).toLocaleString()})`;
        }
      }
      break;
    }

    case 'NSW': {
      standardDuty = calcNSWStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        if (propertyPrice <= 800000) {
          amount = 0;
          fhbExemptionApplied = true;
          savingsAmount = standardDuty;
          eligibilityMessage = `🎉 Full exemption! NSW First Home Buyer Assistance saves you $${Math.round(savingsAmount).toLocaleString()}`;
        } else if (propertyPrice <= 1000000) {
          // Partial: sliding scale
          const concessionFraction = (1000000 - propertyPrice) / 200000;
          concessionAmount = standardDuty * concessionFraction;
          amount = standardDuty - concessionAmount;
          fhbExemptionApplied = true;
          savingsAmount = concessionAmount;
          eligibilityMessage = `✅ Partial NSW First Home Buyer Assistance applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
        } else {
          amount = standardDuty;
          eligibilityMessage = 'Standard rates apply (property over $1,000,000 threshold)';
        }
      } else {
        amount = standardDuty;
      }
      break;
    }

    case 'VIC': {
      standardDuty = calcVICStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        if (propertyType === 'New Build' && propertyPrice < 1000000) {
          amount = 0;
          fhbExemptionApplied = true;
          savingsAmount = standardDuty;
          eligibilityMessage = `🎉 Full exemption! VIC First Home Buyer duty exemption (New Build) saves you $${Math.round(savingsAmount).toLocaleString()}`;
        } else if (propertyType === 'Established Home') {
          if (propertyPrice < 600000) {
            amount = 0;
            fhbExemptionApplied = true;
            savingsAmount = standardDuty;
            eligibilityMessage = `🎉 Full exemption! VIC First Home Buyer duty exemption saves you $${Math.round(savingsAmount).toLocaleString()}`;
          } else if (propertyPrice <= 750000) {
            // Partial: sliding scale
            const concessionFraction = (750000 - propertyPrice) / 150000;
            concessionAmount = standardDuty * concessionFraction;
            amount = standardDuty - concessionAmount;
            fhbExemptionApplied = true;
            savingsAmount = concessionAmount;
            eligibilityMessage = `✅ Partial VIC First Home Buyer concession applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
          } else {
            amount = standardDuty;
            eligibilityMessage = 'Standard rates apply (property over $750,000 threshold)';
          }
        } else {
          amount = standardDuty;
        }
      } else {
        amount = standardDuty;
      }
      break;
    }

    case 'WA': {
      standardDuty = calcWAStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        if (propertyPrice <= 430000) {
          amount = 0;
          fhbExemptionApplied = true;
          savingsAmount = standardDuty;
          eligibilityMessage = `🎉 Full exemption! WA First Home Buyer concession saves you $${Math.round(savingsAmount).toLocaleString()}`;
        } else if (propertyPrice <= 530000) {
          // Partial: sliding scale
          const concessionFraction = (530000 - propertyPrice) / 100000;
          concessionAmount = standardDuty * concessionFraction;
          amount = standardDuty - concessionAmount;
          fhbExemptionApplied = true;
          savingsAmount = concessionAmount;
          eligibilityMessage = `✅ Partial WA First Home Buyer concession applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
        } else {
          amount = standardDuty;
          eligibilityMessage = 'Standard rates apply (property over $530,000 threshold)';
        }
      } else {
        amount = standardDuty;
      }
      break;
    }

    case 'SA': {
      standardDuty = calcSAStandard(propertyPrice);
      amount = standardDuty;
      eligibilityMessage = 'ℹ️ SA has no stamp duty concession for first home buyers';
      break;
    }

    case 'TAS': {
      standardDuty = calcTASStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        amount = standardDuty * 0.5;
        concessionAmount = standardDuty * 0.5;
        fhbExemptionApplied = true;
        savingsAmount = concessionAmount;
        eligibilityMessage = `✅ TAS First Home Buyer 50% concession applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
      } else {
        amount = standardDuty;
      }
      break;
    }

    case 'ACT': {
      standardDuty = calcACTStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        amount = 0;
        fhbExemptionApplied = true;
        savingsAmount = standardDuty;
        eligibilityMessage = `🎉 Full exemption! ACT First Home Buyer concession saves you $${Math.round(savingsAmount).toLocaleString()}`;
      } else {
        amount = standardDuty;
      }
      break;
    }

    case 'NT': {
      standardDuty = calcNTStandard(propertyPrice);

      if (isFirstHomeBuyer) {
        const discount = 18601;
        const discountApplied = Math.min(discount, standardDuty);
        amount = Math.max(0, standardDuty - discountApplied);
        concessionAmount = discountApplied;
        fhbExemptionApplied = discountApplied > 0;
        savingsAmount = discountApplied;
        eligibilityMessage = `✅ NT First Home Buyer $18,601 discount applied. You save $${Math.round(savingsAmount).toLocaleString()}`;
      } else {
        amount = standardDuty;
      }
      break;
    }

    default:
      amount = 0;
  }

  return {
    amount: Math.round(amount),
    fhbExemptionApplied,
    state,
    standardDuty: Math.round(standardDuty),
    concessionAmount: Math.round(concessionAmount),
    savingsAmount: Math.round(savingsAmount),
    eligibilityMessage,
    disclaimer,
  };
}
