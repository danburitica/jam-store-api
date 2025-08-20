/**
 * Genera una referencia única para transacciones
 * Formato: REF-{timestamp}-{random}
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `REF-${timestamp}-${random}`.toUpperCase();
}
