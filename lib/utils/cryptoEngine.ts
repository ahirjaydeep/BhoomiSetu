import crypto from 'crypto';

/**
 * Deeply sorts the keys of an object to ensure deterministic stringification.
 */
function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  
  for (const key of sortedKeys) {
    result[key] = sortObjectKeys(obj[key]);
  }
  
  return result;
}

/**
 * Generates a deterministic SHA-256 hash for a given payload.
 * @param payload The data to be hashed (e.g., Award calculation data)
 * @returns A hexadecimal SHA-256 hash string
 */
export function generateSHA256Hash(payload: any): string {
  // 1. Sort the keys deterministically to prevent hash mismatch due to arbitrary JSON property ordering
  const sortedPayload = sortObjectKeys(payload);
  
  // 2. Stringify the sorted object
  const jsonString = JSON.stringify(sortedPayload);
  
  // 3. Generate the SHA-256 hash using Node's native crypto module
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}
