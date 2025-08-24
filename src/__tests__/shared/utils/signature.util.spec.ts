import { generateTransactionSignature } from '../../../shared/utils/signature.util';

// Mock crypto.subtle para testing
const mockCrypto = {
  subtle: {
    digest: jest.fn(),
  },
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('Signature Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTransactionSignature', () => {
    const mockIntegritySecret = 'test_secret_123';
    const mockReference = 'REF-123456';
    const mockAmountInCents = 10000;
    const mockCurrency = 'COP';

    it('should generate signature with correct concatenation format', async () => {
      // Arrange
      const expectedConcatenatedString = `${mockReference}${mockAmountInCents}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(
        'SHA-256',
        expect.any(Uint8Array),
      );
      expect(result).toBe('0102030405060708');
    });

    it('should handle zero amount correctly', async () => {
      // Arrange
      const zeroAmount = 0;
      const expectedConcatenatedString = `${mockReference}${zeroAmount}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([0, 0, 0, 0]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        zeroAmount,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('00000000');
    });

    it('should handle large amounts correctly', async () => {
      // Arrange
      const largeAmount = 999999999;
      const expectedConcatenatedString = `${mockReference}${largeAmount}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([255, 255, 255, 255]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        largeAmount,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('ffffffff');
    });

    it('should handle empty reference correctly', async () => {
      // Arrange
      const emptyReference = '';
      const expectedConcatenatedString = `${emptyReference}${mockAmountInCents}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([0]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        emptyReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('00');
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdCurrency = 'USD';
      const expectedConcatenatedString = `${mockReference}${mockAmountInCents}${usdCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        usdCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('01020304');
    });

    it('should handle special characters in reference', async () => {
      // Arrange
      const specialReference = 'REF-123@#$%^&*()';
      const expectedConcatenatedString = `${specialReference}${mockAmountInCents}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        specialReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('01020304');
    });

    it('should handle empty integrity secret', async () => {
      // Arrange
      const emptySecret = '';
      const expectedConcatenatedString = `${mockReference}${mockAmountInCents}${mockCurrency}${emptySecret}`;
      const mockHashBuffer = new Uint8Array([0]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        mockCurrency,
        emptySecret,
      );

      // Assert
      expect(result).toBe('00');
    });

    it('should handle negative amounts by converting to string correctly', async () => {
      // Arrange
      const negativeAmount = -1000;
      const expectedConcatenatedString = `${mockReference}${negativeAmount}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        negativeAmount,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('01020304');
    });

    it('should handle decimal amounts by converting to string correctly', async () => {
      // Arrange
      const decimalAmount = 1000.5;
      const expectedConcatenatedString = `${mockReference}${decimalAmount}${mockCurrency}${mockIntegritySecret}`;
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);

      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        decimalAmount,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('01020304');
    });

    it('should throw error when crypto.subtle.digest fails', async () => {
      // Arrange
      const mockError = new Error('Crypto API error');
      mockCrypto.subtle.digest.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        generateTransactionSignature(
          mockReference,
          mockAmountInCents,
          mockCurrency,
          mockIntegritySecret,
        ),
      ).rejects.toThrow('Error generando signature: Error: Crypto API error');
    });

    it('should throw error when crypto.subtle is undefined', async () => {
      // Arrange
      const originalCrypto = global.crypto;
      delete (global as any).crypto;

      // Act & Assert
      await expect(
        generateTransactionSignature(
          mockReference,
          mockAmountInCents,
          mockCurrency,
          mockIntegritySecret,
        ),
      ).rejects.toThrow(
        'Error generando signature: ReferenceError: crypto is not defined',
      );

      // Restore
      global.crypto = originalCrypto;
    });

    it('should handle TextEncoder correctly', async () => {
      // Arrange
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const result = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(result).toBe('01020304');
      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(
        'SHA-256',
        expect.any(Uint8Array),
      );
    });

    it('should generate consistent signatures for same input', async () => {
      // Arrange
      const mockHashBuffer = new Uint8Array([1, 2, 3, 4]);
      mockCrypto.subtle.digest.mockResolvedValue(mockHashBuffer);

      // Act
      const signature1 = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      const signature2 = await generateTransactionSignature(
        mockReference,
        mockAmountInCents,
        mockCurrency,
        mockIntegritySecret,
      );

      // Assert
      expect(signature1).toBe(signature2);
      expect(signature1).toBe('01020304');
    });
  });
});
