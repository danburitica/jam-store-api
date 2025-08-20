/**
 * Genera una firma SHA256 para validar la integridad de las transacciones
 * Formato: <Referencia><Monto><Moneda><IntegritySecret>
 *
 * @param reference - Referencia única de la transacción
 * @param amountInCents - Monto en centavos
 * @param currency - Moneda (siempre "COP" para Colombia)
 * @param integritySecret - Secret de integridad de la pasarela
 * @returns Promise<string> - Hash SHA256 en formato hexadecimal
 */
export async function generateTransactionSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): Promise<string> {
  try {
    // Formato: <Referencia><Monto><Moneda><IntegritySecret>
    const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;

    // Usar Web Crypto API para generar SHA256
    const encodedText = new TextEncoder().encode(concatenatedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedText);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  } catch (error) {
    throw new Error(`Error generando signature: ${error}`);
  }
}
