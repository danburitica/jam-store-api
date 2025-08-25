import { generateTransactionReference } from '../../../shared/utils/reference.util';

describe('Reference Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTransactionReference', () => {
    it('should generate reference with correct format', () => {
      // Act
      const reference = generateTransactionReference();

      // Assert
      expect(reference).toMatch(/^REF-[a-z0-9]+-[a-z0-9]+$/i);
      expect(reference.startsWith('REF-')).toBe(true);
      expect(reference.split('-')).toHaveLength(3);
    });

    it('should generate unique references on multiple calls', () => {
      // Act
      const references = Array.from({ length: 10 }, () =>
        generateTransactionReference(),
      );

      // Assert
      const uniqueReferences = new Set(references);
      expect(uniqueReferences.size).toBe(10);
      expect(references.every((ref) => ref.startsWith('REF-'))).toBe(true);
    });

    it('should generate references with consistent length pattern', () => {
      // Act
      const references = Array.from({ length: 5 }, () =>
        generateTransactionReference(),
      );

      // Assert
      references.forEach((reference) => {
        const parts = reference.split('-');
        expect(parts[0]).toBe('REF');
        expect(parts[1].length).toBeGreaterThan(0); // timestamp
        expect(parts[2].length).toBeGreaterThan(0); // random
      });
    });

    it('should generate uppercase references', () => {
      // Act
      const reference = generateTransactionReference();

      // Assert
      expect(reference).toBe(reference.toUpperCase());
    });

    it('should handle rapid successive calls', () => {
      // Act
      const startTime = Date.now();
      const references = Array.from({ length: 100 }, () =>
        generateTransactionReference(),
      );
      const endTime = Date.now();

      // Assert
      expect(references.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // All should be unique
      const uniqueReferences = new Set(references);
      expect(uniqueReferences.size).toBe(100);
    });

    it('should generate references with valid characters only', () => {
      // Act
      const references = Array.from({ length: 20 }, () =>
        generateTransactionReference(),
      );

      // Assert
      references.forEach((reference) => {
        // Should only contain alphanumeric characters and hyphens
        expect(reference).toMatch(/^[A-Z0-9-]+$/);
        expect(reference).not.toMatch(/[^A-Z0-9-]/);
      });
    });

    it('should have reasonable timestamp length', () => {
      // Act
      const reference = generateTransactionReference();
      const parts = reference.split('-');

      // Assert
      expect(parts[1].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeLessThan(20); // Reasonable length for base36 timestamp
    });

    it('should have reasonable random part length', () => {
      // Act
      const reference = generateTransactionReference();
      const parts = reference.split('-');

      // Assert
      expect(parts[2].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeLessThan(15); // Reasonable length for random part
    });

    it('should generate references that are URL-safe', () => {
      // Act
      const references = Array.from({ length: 10 }, () =>
        generateTransactionReference(),
      );

      // Assert
      references.forEach((reference) => {
        // Should not contain characters that need URL encoding
        expect(reference).not.toMatch(/[^A-Z0-9-]/);
        expect(encodeURIComponent(reference)).toBe(reference);
      });
    });

    it('should maintain consistent format across different execution contexts', async () => {
      // Act
      const references = [];

      // Simulate different execution contexts
      for (let i = 0; i < 5; i++) {
        const reference = generateTransactionReference();
        references.push(reference);

        // Small delay to simulate different timestamps
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // Assert
      references.forEach((reference) => {
        expect(reference).toMatch(/^REF-[a-z0-9]+-[a-z0-9]+$/i);
        expect(reference.split('-')).toHaveLength(3);
      });
    });

    it('should handle edge case of very small timestamp', () => {
      // Arrange - Mock Date.now to return a very small value
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1);

      // Act
      const reference = generateTransactionReference();

      // Assert
      expect(reference).toMatch(/^REF-[a-z0-9]+-[a-z0-9]+$/i);
      expect(reference.startsWith('REF-')).toBe(true);

      // Restore
      Date.now = originalDateNow;
    });

    it('should handle edge case of very large timestamp', () => {
      // Arrange - Mock Date.now to return a very large value
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => Number.MAX_SAFE_INTEGER);

      // Act
      const reference = generateTransactionReference();

      // Assert
      expect(reference).toMatch(/^REF-[a-z0-9]+-[a-z0-9]+$/i);
      expect(reference.startsWith('REF-')).toBe(true);

      // Restore
      Date.now = originalDateNow;
    });

    it('should generate references that are database-safe', () => {
      // Act
      const references = Array.from({ length: 15 }, () =>
        generateTransactionReference(),
      );

      // Assert
      references.forEach((reference) => {
        // Should not contain characters that could cause SQL injection issues
        expect(reference).not.toMatch(/['";\\]/);
        expect(reference).not.toMatch(/[<>]/);
      });
    });

    it('should generate references suitable for logging', () => {
      // Act
      const references = Array.from({ length: 8 }, () =>
        generateTransactionReference(),
      );

      // Assert
      references.forEach((reference) => {
        // Should be easily readable in logs
        expect(reference.length).toBeLessThan(50); // Reasonable length for logs
        expect(reference).not.toMatch(/[^\w-]/); // Only alphanumeric and hyphens
      });
    });
  });
});
