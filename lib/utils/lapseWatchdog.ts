export function checkSection19LapseRisk(
  sec11Date: Date,
  sec19Date: Date | null
): { status: string; daysRemaining: number } {
  // If Section 19 declaration is already made, there is no risk of lapse.
  if (sec19Date) {
    return { status: 'SAFE', daysRemaining: 0 };
  }

  const now = new Date();
  const sec11Time = sec11Date.getTime();
  const diffTime = now.getTime() - sec11Time;
  
  // Calculate days elapsed (1000ms * 60s * 60m * 24h)
  const daysElapsed = diffTime / (1000 * 60 * 60 * 24);
  const daysRemaining = 365 - Math.floor(daysElapsed);

  // Return status based on critical thresholds
  if (daysRemaining <= 0) {
    return { status: 'LAPSED', daysRemaining };
  } else if (daysRemaining <= 30) {
    return { status: 'CRITICAL', daysRemaining };
  } else if (daysRemaining <= 90) {
    return { status: 'AMBER', daysRemaining };
  } else {
    return { status: 'NORMAL', daysRemaining };
  }
}
