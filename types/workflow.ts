export enum RfctlarrStage {
  STAGE_1_PROPOSAL = 1,
  STAGE_2_SIA = 2,
  STAGE_3_SEC11_GAZETTE = 3,
  STAGE_4_SEC15_HEARING = 4,
  STAGE_5_SEC19_DECLARATION = 5,
  STAGE_6_SEC23_AWARD = 6,
  STAGE_7_SEC38_POSSESSION = 7
}

export interface StageTransitionLog {
  fromStage: number;
  toStage: number;
  transitionedAt: Date;
  transitionedBy: string;
  remarks?: string;
}
