import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from '../../../../infrastructure/persistence/repositories/payment.repository';
import {
  Payment,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import {
  CustomerData,
  PaymentMethod,
} from '../../../../domain/entities/payment.entity';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentRepository],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  describe('save', () => {
    it('should save a payment successfully', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      // Act
      const result = await repository.save(payment);

      // Assert
      expect(result).toBeInstanceOf(Payment);
      expect(result.id).toBe(payment.id);
      expect(result.amount).toBe(payment.amount);
      expect(result.currency).toBe(payment.currency);
      expect(result.reference).toBe(payment.reference);
    });

    it('should save multiple payments correctly', async () => {
      // Arrange
      const payment1 = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test1@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      const payment2 = Payment.create(
        20000,
        'USD',
        'REF-789012',
        'test2@example.com',
        {
          fullName: 'María García',
          legalId: '87654321',
          legalIdType: 'CE',
        } as CustomerData,
        {
          type: 'debit',
          token: 'tok_test_456',
          installments: 3,
        } as PaymentMethod,
        'acceptance_token_456',
        'signature_456',
      );

      // Act
      await repository.save(payment1);
      await repository.save(payment2);

      // Assert
      const found1 = await repository.findById(payment1.id);
      const found2 = await repository.findById(payment2.id);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
      expect(found1?.amount).toBe(10000);
      expect(found2?.amount).toBe(20000);
    });

    it('should handle payment with zero amount', async () => {
      // Arrange
      const payment = Payment.create(
        0,
        'COP',
        'REF-ZERO',
        'test@example.com',
        {
          fullName: 'Test User',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      // Act
      const result = await repository.save(payment);

      // Assert
      expect(result.amount).toBe(0);
    });

    it('should handle payment with large amount', async () => {
      // Arrange
      const payment = Payment.create(
        999999999,
        'COP',
        'REF-LARGE',
        'test@example.com',
        {
          fullName: 'Test User',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      // Act
      const result = await repository.save(payment);

      // Assert
      expect(result.amount).toBe(999999999);
    });
  });

  describe('findById', () => {
    it('should find payment by ID successfully', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      // Act
      const result = await repository.findById(payment.id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(payment.id);
      expect(result?.amount).toBe(payment.amount);
    });

    it('should return null when payment not found', async () => {
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
  });

  describe('findByReference', () => {
    it('should find payment by reference successfully', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      // Act
      const result = await repository.findByReference('REF-123456');

      // Assert
      expect(result).toBeDefined();
      expect(result?.reference).toBe('REF-123456');
      expect(result?.id).toBe(payment.id);
    });

    it('should return null when reference not found', async () => {
      // Arrange
      const nonExistentReference = 'REF-NON-EXISTENT';

      // Act
      const result = await repository.findByReference(nonExistentReference);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle empty reference', async () => {
      // Arrange
      const emptyReference = '';

      // Act
      const result = await repository.findByReference(emptyReference);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle special characters in reference', async () => {
      // Arrange
      const specialReference = 'REF-SPECIAL-@#$%^&*()';
      const payment = Payment.create(
        10000,
        'COP',
        specialReference,
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      // Act
      const result = await repository.findByReference(specialReference);

      // Assert
      expect(result).toBeDefined();
      expect(result?.reference).toBe(specialReference);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status successfully', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);
      const originalUpdatedAt = payment.updatedAt;

      // Act
      const result = await repository.updateStatus(payment.id, 'APPROVED');

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe(PaymentStatus.APPROVED);
      expect(result?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should return null when payment not found for status update', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';

      // Act
      const result = await repository.updateStatus(nonExistentId, 'APPROVED');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle all payment statuses correctly', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      const statuses = ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'];

      for (const status of statuses) {
        // Act
        const result = await repository.updateStatus(payment.id, status);

        // Assert
        expect(result).toBeDefined();
        expect(result?.status).toBe(status);
      }
    });

    it('should handle unknown status by defaulting to PENDING', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      // Act
      const result = await repository.updateStatus(
        payment.id,
        'UNKNOWN_STATUS',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe(PaymentStatus.PENDING);
    });

    it('should handle empty status string', async () => {
      // Arrange
      const payment = Payment.create(
        10000,
        'COP',
        'REF-123456',
        'test@example.com',
        {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );
      await repository.save(payment);

      // Act
      const result = await repository.updateStatus(payment.id, '');

      // Assert
      expect(result).toBeDefined();
      expect(result?.status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent saves correctly', async () => {
      // Arrange
      const payments = Array.from({ length: 10 }, (_, i) =>
        Payment.create(
          1000 + i * 1000,
          'COP',
          `REF-${i}`,
          `test${i}@example.com`,
          {
            fullName: `User ${i}`,
            legalId: `12345678${i}`,
            legalIdType: 'CC',
          } as CustomerData,
          {
            type: 'card',
            token: `tok_test_${i}`,
            installments: 1,
          } as PaymentMethod,
          `acceptance_token_${i}`,
          `signature_${i}`,
        ),
      );

      // Act
      const savePromises = payments.map((payment) => repository.save(payment));
      const results = await Promise.all(savePromises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.amount).toBe(1000 + index * 1000);
        expect(result.reference).toBe(`REF-${index}`);
      });
    });

    it('should handle very long customer names', async () => {
      // Arrange
      const longName = 'A'.repeat(1000);
      const payment = Payment.create(
        10000,
        'COP',
        'REF-LONG-NAME',
        'test@example.com',
        {
          fullName: longName,
          legalId: '12345678',
          legalIdType: 'CC',
        } as CustomerData,
        {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      // Act
      const result = await repository.save(payment);

      // Assert
      expect(result.customerData.fullName).toBe(longName);
    });

    it('should handle special characters in customer data', async () => {
      // Arrange
      const specialName = "José-Miguel O'Connor-Smith";
      const payment = Payment.create(
        10000,
        'COP',
        'REF-SPECIAL-CHAR',
        'test@example.com',
        {
          fullName: specialName,
          legalId: 'ABC-123.456.789',
          legalIdType: 'PP',
        } as CustomerData,
        {
          type: 'credit',
          token: 'tok_special_123',
          installments: 12,
        } as PaymentMethod,
        'acceptance_token_123',
        'signature_123',
      );

      // Act
      const result = await repository.save(payment);

      // Assert
      expect(result.customerData.fullName).toBe(specialName);
      expect(result.customerData.legalId).toBe('ABC-123.456.789');
      expect(result.paymentMethod.installments).toBe(12);
    });
  });
});
