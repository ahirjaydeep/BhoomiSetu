import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import type { Role } from '@/types/schema';

export interface AuthenticatedRequest extends NextRequest {
  user: DecodedIdToken;
}

type HandlerFunction = (req: AuthenticatedRequest, context: any) => Promise<NextResponse> | NextResponse;

export function withAuth(allowedRoles: string[], handler: HandlerFunction) {
  return async (request: NextRequest, context: any) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
      }

      const token = authHeader.split('Bearer ')[1];
      let decodedToken: DecodedIdToken;

      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }

      // If specific roles are required, verify them
      if (allowedRoles.length > 0) {
        const userRole = decodedToken.role as string;
        const hasRoleByString = userRole && allowedRoles.includes(userRole);
        const hasRoleByBooleanClaim = allowedRoles.some(role => decodedToken[role] === true);
        
        if (!hasRoleByString && !hasRoleByBooleanClaim) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }
      }

      // Attach decoded user context to the request object
      Object.assign(request, { user: decodedToken });

      // Execute the actual handler with the augmented request
      return handler(request as AuthenticatedRequest, context);
    } catch (error: any) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
}
