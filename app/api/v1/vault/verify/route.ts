import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    const hashToVerify = searchParams.get('hashToVerify');

    // Basic validation
    if (!documentId || !hashToVerify) {
      return NextResponse.json(
        { error: 'Missing required query parameters: documentId and hashToVerify' }, 
        { status: 400 }
      );
    }

    // 1. Fetch the document record from the secure Vault
    const docRef = adminDb.collection('crypto_vault').doc(documentId);
    const docSnap = await docRef.get();

    // 2. Validate existence (Invalid Serial)
    if (!docSnap.exists) {
      return NextResponse.json({ 
        status: 'NOT_FOUND', 
        message: 'Document serial number is invalid.' 
      }, { status: 404 });
    }

    const record = docSnap.data();

    // 3. Cryptographic Verification (Case-insensitive hex match)
    if (record?.sha256Hash && record.sha256Hash.toLowerCase() === hashToVerify.toLowerCase()) {
      return NextResponse.json({ 
        status: 'VERIFIED_ORIGINAL', 
        documentType: record.documentType, 
        issuedAt: record.issuedAt 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        status: 'TAMPERED_INVALID', 
        message: 'Document contents have been altered.' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error verifying cryptographic document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
