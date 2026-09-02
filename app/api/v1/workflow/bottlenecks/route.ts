import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import { checkSection19LapseRisk } from '@/lib/utils/lapseWatchdog';

async function bottleneckDiagnosticsHandler(req: AuthenticatedRequest) {
  try {
    // Fetch all Projects where currentStage is 3 (Sec 11) or 4 (Sec 15)
    // These are the projects currently racing against the 12-month Section 19(7) statutory limit.
    const projectsSnap = await adminDb.collection('projects')
      .where('current_stage', 'in', [3, 4])
      .get();

    const criticalProjects: Array<{ id: string, title: string, status: string, daysRemaining: number }> = [];
    const amberProjects: Array<{ id: string, title: string, status: string, daysRemaining: number }> = [];

    projectsSnap.forEach(doc => {
      const data = doc.data();
      
      // We only evaluate if sec11Date is present, as it is the starting line for the countdown.
      if (data.sec11Date) {
        // Convert Firestore Timestamps to JS Dates
        const sec11Date = data.sec11Date.toDate ? data.sec11Date.toDate() : new Date(data.sec11Date);
        const sec19Date = data.sec19Date ? (data.sec19Date.toDate ? data.sec19Date.toDate() : new Date(data.sec19Date)) : null;

        // Feed through the mathematical lapse engine
        const risk = checkSection19LapseRisk(sec11Date, sec19Date);

        const projectSummary = {
          id: doc.id,
          title: data.title || data.name || doc.id,
          status: risk.status,
          daysRemaining: risk.daysRemaining
        };

        if (risk.status === 'LAPSED' || risk.status === 'CRITICAL') {
          criticalProjects.push(projectSummary);
        } else if (risk.status === 'AMBER') {
          amberProjects.push(projectSummary);
        }
      }
    });

    const report = {
      criticalProjects,
      amberProjects,
      totalDelayed: criticalProjects.length + amberProjects.length
    };

    return NextResponse.json(report, { status: 200 });

  } catch (error: any) {
    console.error('Error running bottleneck diagnostics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withAuth(['central_admin'], bottleneckDiagnosticsHandler);
