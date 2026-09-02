import type { FirstScheduleAward, SecondScheduleRnR } from '@/types/valuation';

/**
 * Safely parses any value into a valid number, defaulting to the fallback (usually 0) if invalid, NaN, or undefined.
 * This eliminates type coercion bugs during UI rendering.
 */
export function safeNumber(value: any, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Calculates the market value of land (Sec 26).
 */
export function calculateBaseMarketValue(
  area: number,
  circleRate: number,
  saleDeedAvg: number,
  multiplier: number,
  isUrban: boolean
): { baseRate: number; marketValue: number } {
  const safeArea = safeNumber(area);
  const safeCircle = safeNumber(circleRate);
  const safeSale = safeNumber(saleDeedAvg);
  const safeMulti = isUrban ? 1.0 : safeNumber(multiplier, 1.0);

  const baseRate = Math.max(safeCircle, safeSale);
  const marketValue = baseRate * safeArea * safeMulti;

  return { baseRate, marketValue };
}

/**
 * Calculates Solatium and Interest components (Sec 30)
 */
export function calculateSolatiumAndInterest(
  marketValue: number,
  structureValue: number,
  treeValue: number,
  sec11Date: Date,
  awardDate: Date
): { 
  totalBaseCompensation: number; 
  solatium: number; 
  interest: number; 
  grossAward: number;
  daysElapsed: number;
} {
  const safeMarket = safeNumber(marketValue);
  const safeStructure = safeNumber(structureValue);
  const safeTree = safeNumber(treeValue);

  const totalBaseCompensation = safeMarket + safeStructure + safeTree;
  const solatium = totalBaseCompensation; // 100% of base as per RFCTLARR
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(0, Math.floor((awardDate.getTime() - sec11Date.getTime()) / msPerDay));
  const yearsElapsed = daysElapsed / 365;

  // 12% p.a. interest from Sec 11 to Award
  const interest = safeMarket * 0.12 * yearsElapsed;
  
  const grossAward = totalBaseCompensation + solatium + interest;

  return {
    totalBaseCompensation,
    solatium,
    interest,
    grossAward,
    daysElapsed
  };
}

/**
 * Calculates landowner share and net payable amounts securely.
 */
export function calculateLandownerShare(
  grossAwardAmount: number,
  sharePercentage: number,
  deductions: number
): { grossPayout: number; netPayable: number } {
  const safeAward = safeNumber(grossAwardAmount);
  const safeShare = safeNumber(sharePercentage);
  const safeDeductions = safeNumber(deductions);

  const grossPayout = safeAward * (safeShare / 100);
  const netPayable = grossPayout - safeDeductions;

  return { grossPayout, netPayable };
}

/**
 * Calculates the fixed entitlements under the Second Schedule (R&R) of the RFCTLARR Act 2013.
 */
export function calculateSecondSchedule(
  losesHouse: boolean,
  hasCattle: boolean,
  isArtisan: boolean
): SecondScheduleRnR {
  // 1. Subsistence Grant (Always Rs 36,000 for affected families)
  const subsistenceGrant = 36000;

  // 2. Transportation Grant (Always Rs 50,000 for shifting assistance)
  const transportationGrant = 50000;

  // 3. Resettlement Allowance (Rs 50,000 only if losesHouse is true)
  const resettlementAllowance = losesHouse ? 50000 : 0;

  // 4. Cattle Shed Grant or Artisan Grant (Rs 25,000)
  let cattleShedGrant = 0;
  if (hasCattle || isArtisan) {
    cattleShedGrant = 25000;
  }

  // 5. Total R&R Grants
  const totalRnR = subsistenceGrant + transportationGrant + resettlementAllowance + cattleShedGrant;

  return {
    subsistenceGrant,
    transportationGrant,
    resettlementAllowance,
    cattleShedGrant,
    totalRnR,
  };
}

/**
 * Calculates the complete First Schedule Award (Market Value + Multiplier + Solatium + Interest)
 */
export function calculateFirstSchedule(
  area: number,
  circleRate: number,
  avgSaleDeed: number,
  isUrban: boolean,
  distanceToUrban: number,
  attachedAssetsValue: number,
  sec11Date: Date,
  awardDate: Date
): FirstScheduleAward {
  const safeArea = safeNumber(area);
  const baseRate = Math.max(safeNumber(circleRate), safeNumber(avgSaleDeed));
  const baseMarketValue = baseRate * safeArea;
  
  let multiplierFactor = 1.0;
  if (!isUrban) {
    if (distanceToUrban > 30) multiplierFactor = 2.0;
    else if (distanceToUrban > 20) multiplierFactor = 1.5;
    else if (distanceToUrban > 10) multiplierFactor = 1.2;
    else multiplierFactor = 1.0;
  }
  
  const multipliedValue = baseMarketValue * multiplierFactor;
  const safeAssets = safeNumber(attachedAssetsValue);
  const totalMarketValue = multipliedValue + safeAssets;
  
  const mandatorySolatium = totalMarketValue; // 100% of market value
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(0, Math.floor((awardDate.getTime() - sec11Date.getTime()) / msPerDay));
  const yearsElapsed = daysElapsed / 365;
  const additionalInterest = totalMarketValue * 0.12 * yearsElapsed;
  
  const finalFirstScheduleTotal = totalMarketValue + mandatorySolatium + additionalInterest;
  
  return {
    baseMarketValue,
    multiplierFactor,
    multipliedValue,
    attachedAssetsValue: safeAssets,
    totalMarketValue,
    mandatorySolatium,
    additionalInterest,
    finalFirstScheduleTotal
  };
}
