export type DocumentType = 'FORM_11_AWARD' | 'FORM_16_POSSESSION';

export interface CryptographicRecord {
  documentId: string;
  projectId: string;
  parcelId: string;
  documentType: DocumentType;
  payloadSnapshot: string;
  sha256Hash: string;
  issuedAt: Date;
  issuedBy: string; // User UID of the SLAO official
}
