import { RfctlarrStage } from '@/types/workflow';

export interface WorkflowContext {
  sec11Date?: Date | null;
  sec11GazetteUrl?: string | null;
  hasUnresolvedObjections?: boolean;
  allParcelsValued?: boolean;
  allAwardsVaulted?: boolean;
  fundsAvailable?: boolean;
  valuationsComputedPercentage?: number;
  form11Vaulted?: boolean;
}

export function canAdvanceStage(
  currentStage: number,
  targetStage: number,
  context?: WorkflowContext
): { allowed: boolean; reason?: string } {
  // 1. Strict Sequential Logic
  if (targetStage !== currentStage + 1) {
    return {
      allowed: false,
      reason: "Statutory stages cannot be skipped or reversed.",
    };
  }

  // 2. Specific Prerequisites
  switch (targetStage) {
    case RfctlarrStage.STAGE_4_SEC15_HEARING:
      // Moving from Stage 3 to 4
      if (!context?.sec11Date) {
        return {
          allowed: false,
          reason: "Cannot proceed to Section 15 Hearings without a valid Section 11 Notification Date.",
        };
      }
      if (!context?.sec11GazetteUrl) {
        return {
          allowed: false,
          reason: "Cannot proceed: Must have valid sec11GazetteUrl uploaded.",
        };
      }
      break;

    case RfctlarrStage.STAGE_5_SEC19_DECLARATION:
      // Moving from Stage 4 to 5
      if (!context?.sec11Date) {
        return {
          allowed: false,
          reason: "Missing Section 11 Notification Date to calculate the 60-day mandatory objection period.",
        };
      }
      
      const now = new Date();
      const sec11Time = context.sec11Date.getTime();
      const diffDays = (now.getTime() - sec11Time) / (1000 * 60 * 60 * 24);
      
      if (diffDays < 60) {
        return {
          allowed: false,
          reason: `Section 15 mandates a 60-day objection period. Only ${Math.floor(diffDays)} days have elapsed since Section 11 Notification.`,
        };
      }

      if (context?.hasUnresolvedObjections) {
        return {
          allowed: false,
          reason: "Cannot advance to Stage 5: All public objections filed during Stage 4 must be marked as RESOLVED or HEARING_COMPLETED.",
        };
      }
      break;

    case RfctlarrStage.STAGE_6_SEC23_AWARD:
      if (!context?.allParcelsValued) {
        return {
          allowed: false,
          reason: "Cannot proceed: Total calculated market valuation must be non-zero for all affected parcels.",
        };
      }
      break;

    case RfctlarrStage.STAGE_7_SEC38_POSSESSION:
      if (!context?.allAwardsVaulted) {
        return {
          allowed: false,
          reason: "Cannot proceed: 100% of Form 11 Awards must have sha256Hash seals in the crypto_vault.",
        };
      }
      break;

    default:
      break;
  }

  return { allowed: true };
}
