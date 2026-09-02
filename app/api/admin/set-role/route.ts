import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import type { Role } from '@/types/schema';

const VALID_ROLES: Role[] = ['central_admin', 'state_revenue', 'slao_district', 'requiring_body', 'citizen'];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Verify if the requester has the central_admin role
    if (decodedToken.role !== 'central_admin' && decodedToken.central_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: Requires central_admin privileges' }, { status: 403 });
    }

    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json({ error: 'Bad Request: Missing uid or role' }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as Role)) {
      return NextResponse.json({ error: `Bad Request: Invalid role. Valid roles are: ${VALID_ROLES.join(', ')}` }, { status: 400 });
    }

    // Set custom user claims. We assign both a `role` string and a boolean flag.
    await adminAuth.setCustomUserClaims(uid, {
      role: role,
      [role]: true
    });

    return NextResponse.json({ message: `Role '${role}' successfully assigned to user '${uid}'` }, { status: 200 });

  } catch (error: any) {
    console.error('Error assigning role:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
