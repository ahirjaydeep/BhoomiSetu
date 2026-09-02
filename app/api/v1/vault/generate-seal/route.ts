import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { adminDb } from '@/lib/firebase/admin';
import { generateSHA256Hash } from '@/lib/utils/cryptoEngine';
import { CryptographicRecord, DocumentType } from '@/types/vault';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

async function generateSealHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { projectId, parcelId, documentType, payload } = body;

    // Validate required fields
    if (!projectId || !parcelId || !documentType || !payload) {
      return NextResponse.json({ error: 'Missing required parameters: projectId, parcelId, documentType, or payload' }, { status: 400 });
    }

    // 1. Mathematically hash the legal data payload
    const sha256Hash = generateSHA256Hash(payload);

    // 2. Generate a secure, unique document ID sequence
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const documentId = `DOC-2026-${randomSuffix}`;

    // 3. Assemble the Cryptographic Record
    const dbRecord = {
      documentId,
      projectId,
      parcelId,
      documentType: documentType as DocumentType,
      payloadSnapshot: JSON.stringify(payload), // Immutable snapshot of exact data approved
      sha256Hash,
      issuedAt: admin.firestore.FieldValue.serverTimestamp(), // Hardened server timestamp
      issuedBy: req.user.uid // Traceable to the executing official
    };

    // 4. Commit to the immutable Vault collection
    await adminDb.collection('crypto_vault').doc(documentId).set(dbRecord);

    // 5. Return the secure references to the client
    return NextResponse.json({
      success: true,
      documentId,
      sha256Hash
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error generating cryptographic seal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Ensure strict role-based access control (RBAC) to this critical endpoint
export const POST = withAuth(['slao_district', 'state_revenue', 'central_admin'], generateSealHandler);
