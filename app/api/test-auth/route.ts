import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';

export const dynamic = 'force-dynamic';

async function handler(req: AuthenticatedRequest) {
  return NextResponse.json({
    message: 'Success! You have accessed a protected route.',
    user_uid: req.user.uid,
    role: req.user.role || 'no_role_claim_found'
  }, { status: 200 });
}

// Wrap handlers to enforce that ONLY users with 'slao_district' can access this
export const GET = withAuth(['slao_district'], handler);
export const POST = withAuth(['slao_district'], handler);
