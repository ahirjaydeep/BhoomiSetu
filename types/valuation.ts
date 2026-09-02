export interface FirstScheduleAward {
  baseMarketValue: number;
  multiplierFactor: number;
  multipliedValue: number;
  attachedAssetsValue: number;
  totalMarketValue: number;
  mandatorySolatium: number;
  additionalInterest: number;
  finalFirstScheduleTotal: number;
}

export interface SecondScheduleRnR {
  subsistenceGrant: number;
  transportationGrant: number;
  resettlementAllowance: number;
  cattleShedGrant: number;
  totalRnR: number;
}

export interface StatutoryAwardForm11 {
  khasra_no: string;
  calculatedAt: Date;
  firstSchedule: FirstScheduleAward;
  secondSchedule: SecondScheduleRnR;
  grandTotal: number;
}
