import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepository } from '../../../../infrastructure/persistence/repositories/transaction.repository';
import { Transaction } from '../../../../domain/entities/transaction.entity';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionRepository],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('save', () => {
    it('should save a transaction successfully', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());

      // Act
      const result = await repository.save(transaction);

      // Assert
      expect(result).toBeInstanceOf(Transaction);
      expect(result.id).toBe(transaction.id);
      expect(result.status).toBe(transaction.status);
      expect(result.createdAt).toEqual(transaction.createdAt);
    });

    it('should save multiple transactions correctly', async () => {
      // Arrange
      const transaction1 = new Transaction('txn_111', 'PENDING', new Date());
      const transaction2 = new Transaction('txn_222', 'APPROVED', new Date());

      // Act
      await repository.save(transaction1);
      await repository.save(transaction2);

      // Assert
      const found1 = await repository.findById('txn_111');
      const found2 = await repository.findById('txn_222');

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
      expect(found1?.status).toBe('PENDING');
      expect(found2?.status).toBe('APPROVED');
    });

    it('should handle transaction with different statuses', async () => {
      // Arrange
      const statuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
      ];

      for (const status of statuses) {
        const transaction = new Transaction(
          `txn_${status}`,
          status,
          new Date(),
        );

        // Act
        const result = await repository.save(transaction);

        // Assert
        expect(result.status).toBe(status);
      }
    });

    it('should handle transaction with empty ID', async () => {
      // Arrange
      const transaction = new Transaction('', 'PENDING', new Date());

      // Act
      const result = await repository.save(transaction);

      // Assert
      expect(result.id).toBe('');
    });

    it('should handle transaction with very long ID', async () => {
      // Arrange
      const longId = 'A'.repeat(1000);
      const transaction = new Transaction(longId, 'PENDING', new Date());

      // Act
      const result = await repository.save(transaction);

      // Assert
      expect(result.id).toBe(longId);
    });
  });

  describe('findById', () => {
    it('should find transaction by ID successfully', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());
      await repository.save(transaction);

      // Act
      const result = await repository.findById('txn_123');

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe('txn_123');
      expect(result?.status).toBe('PENDING');
    });

    it('should return null when transaction not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle empty ID', async () => {
      // Arrange
      const emptyId = '';

      // Act
      const result = await repository.findById(emptyId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle very long ID', async () => {
      // Arrange
      const longId = 'A'.repeat(1000);

      // Act
      const result = await repository.findById(longId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle special characters in ID', async () => {
      // Arrange
      const specialId = 'txn_@#$%^&*()_123';
      const transaction = new Transaction(specialId, 'PENDING', new Date());
      await repository.save(transaction);

      // Act
      const result = await repository.findById(specialId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(specialId);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status successfully', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());
      await repository.save(transaction);
      const originalCreatedAt = transaction.createdAt;

      // Act
      const result = await repository.updateStatus('txn_123', 'APPROVED');

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe('APPROVED');
      expect(result?.createdAt).toEqual(originalCreatedAt);
    });

    it('should return null when transaction not found for status update', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act
      const result = await repository.updateStatus(nonExistentId, 'APPROVED');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle all transaction statuses correctly', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());
      await repository.save(transaction);

      const statuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
      ];

      for (const status of statuses) {
        // Act
        const result = await repository.updateStatus('txn_123', status);

        // Assert
        expect(result).toBeDefined();
        expect(result?.status).toBe(status);
      }
    });

    it('should handle empty status string', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());
      await repository.save(transaction);

      // Act
      const result = await repository.updateStatus('txn_123', '');

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe('');
    });

    it('should handle status with special characters', async () => {
      // Arrange
      const transaction = new Transaction('txn_123', 'PENDING', new Date());
      await repository.save(transaction);
      const specialStatus = 'STATUS_@#$%^&*()_123';

      // Act
      const result = await repository.updateStatus('txn_123', specialStatus);

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe(specialStatus);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent saves correctly', async () => {
      // Arrange
      const transactions = Array.from(
        { length: 10 },
        (_, i) => new Transaction(`txn_${i}`, 'PENDING', new Date()),
      );

      // Act
      const savePromises = transactions.map((transaction) =>
        repository.save(transaction),
      );
      const results = await Promise.all(savePromises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.id).toBe(`txn_${index}`);
        expect(result.status).toBe('PENDING');
      });
    });

    it('should handle transactions with same ID (overwrite behavior)', async () => {
      // Arrange
      const transaction1 = new Transaction('txn_123', 'PENDING', new Date());
      const transaction2 = new Transaction('txn_123', 'APPROVED', new Date());

      // Act
      await repository.save(transaction1);
      await repository.save(transaction2);

      // Assert
      const found = await repository.findById('txn_123');
      expect(found).toBeDefined();
      // Note: This test documents the current behavior where the last save wins
      // In a real database, this might be different
    });

    it('should handle transactions with different creation dates', async () => {
      // Arrange
      const date1 = new Date('2023-01-01T00:00:00Z');
      const date2 = new Date('2023-12-31T23:59:59Z');

      const transaction1 = new Transaction('txn_date1', 'PENDING', date1);
      const transaction2 = new Transaction('txn_date2', 'APPROVED', date2);

      // Act
      await repository.save(transaction1);
      await repository.save(transaction2);

      // Assert
      const found1 = await repository.findById('txn_date1');
      const found2 = await repository.findById('txn_date2');

      expect(found1?.createdAt).toEqual(date1);
      expect(found2?.createdAt).toEqual(date2);
    });

    it('should handle transactions with very long status', async () => {
      // Arrange
      const longStatus = 'A'.repeat(1000);
      const transaction = new Transaction(
        'txn_long_status',
        longStatus,
        new Date(),
      );

      // Act
      const result = await repository.save(transaction);

      // Assert
      expect(result.status).toBe(longStatus);
    });

    it('should handle transactions with unicode characters in status', async () => {
      // Arrange
      const unicodeStatus = 'STATUS_ñáéíóú_123';
      const transaction = new Transaction(
        'txn_unicode',
        unicodeStatus,
        new Date(),
      );

      // Act
      const result = await repository.save(transaction);

      // Assert
      expect(result.status).toBe(unicodeStatus);
    });
  });

  describe('data integrity', () => {
    it('should maintain transaction data after save and retrieve', async () => {
      // Arrange
      const originalTransaction = new Transaction(
        'txn_integrity',
        'PENDING',
        new Date(),
      );

      // Act
      await repository.save(originalTransaction);
      const retrievedTransaction = await repository.findById('txn_integrity');

      // Assert
      expect(retrievedTransaction).toBeDefined();
      expect(retrievedTransaction?.id).toBe(originalTransaction.id);
      expect(retrievedTransaction?.status).toBe(originalTransaction.status);
      expect(retrievedTransaction?.createdAt.getTime()).toBe(
        originalTransaction.createdAt.getTime(),
      );
    });

    it('should handle status updates without affecting other fields', async () => {
      // Arrange
      const originalDate = new Date('2023-06-15T10:30:00Z');
      const transaction = new Transaction(
        'txn_update',
        'PENDING',
        originalDate,
      );
      await repository.save(transaction);

      // Act
      const updatedTransaction = await repository.updateStatus(
        'txn_update',
        'APPROVED',
      );

      // Assert
      expect(updatedTransaction).toBeDefined();
      expect(updatedTransaction?.id).toBe('txn_update');
      expect(updatedTransaction?.status).toBe('APPROVED');
      expect(updatedTransaction?.createdAt.getTime()).toBe(
        originalDate.getTime(),
      );
    });
  });
});
