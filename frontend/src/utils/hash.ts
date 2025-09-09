// Document hash utility for verification

export async function generateDocumentHash(data: Record<string, any>, fields: string[]): Promise<string> {
  // Extract only the specified fields for hashing
  const hashData: Record<string, any> = {};
  
  fields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      hashData[field] = data[field];
    }
  });
  
  // Create a deterministic string representation
  const dataString = JSON.stringify(hashData, Object.keys(hashData).sort());
  
  // Generate SHA-256 hash
  const encoder = new TextEncoder();
  const data_buffer = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data_buffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function generateVerifyUrl(baseUrl: string, documentId: string, hash: string): string {
  return `${baseUrl}?id=${encodeURIComponent(documentId)}&h=${encodeURIComponent(hash)}`;
}

