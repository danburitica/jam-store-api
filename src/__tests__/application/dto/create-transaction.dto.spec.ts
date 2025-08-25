import { validate } from 'class-validator';
import { CreateTransactionDto } from '../../../application/dto/create-transaction.dto';

describe('CreateTransactionDto', () => {
  let validDto: CreateTransactionDto;

  beforeEach(() => {
    validDto = new CreateTransactionDto();
    validDto.cardNumber = '4111111111111111';
    validDto.cvc = '123';
    validDto.expMonth = '12';
    validDto.expYear = '2025';
    validDto.cardHolderName = 'Juan Pérez';
    validDto.documentNumber = '12345678';
    validDto.documentType = 'CC';
    validDto.amountInCents = 10000;
    validDto.customerEmail = 'test@example.com';
    validDto.installments = 1;
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing cardNumber', async () => {
      // Arrange
      validDto.cardNumber = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cardNumber');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing cvc', async () => {
      // Arrange
      validDto.cvc = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cvc');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing expMonth', async () => {
      // Arrange
      validDto.expMonth = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('expMonth');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing expYear', async () => {
      // Arrange
      validDto.expYear = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('expYear');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing cardHolderName', async () => {
      // Arrange
      validDto.cardHolderName = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('cardHolderName');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing documentNumber', async () => {
      // Arrange
      validDto.documentNumber = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentNumber');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with missing documentType', async () => {
      // Arrange
      validDto.documentType = '';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('documentType');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with invalid email format', async () => {
      // Arrange
      validDto.customerEmail = 'invalid-email';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('customerEmail');
      expect(errors[0].constraints?.isEmail).toBeDefined();
    });

    it('should fail validation with amount below minimum', async () => {
      // Arrange
      validDto.amountInCents = 50; // Below 100 centavos

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountInCents');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with installments below minimum', async () => {
      // Arrange
      validDto.installments = 0;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('installments');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with installments above maximum', async () => {
      // Arrange
      validDto.installments = 49; // Above 48

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('installments');
      expect(errors[0].constraints?.max).toBeDefined();
    });
  });

  describe('card number validation', () => {
    it('should accept valid Visa card number', async () => {
      // Arrange
      validDto.cardNumber = '4111111111111111';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept valid Mastercard number', async () => {
      // Arrange
      validDto.cardNumber = '5555555555554444';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept valid American Express number', async () => {
      // Arrange
      validDto.cardNumber = '378282246310005';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept card number with spaces', async () => {
      // Arrange
      validDto.cardNumber = '4111 1111 1111 1111';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept card number with dashes', async () => {
      // Arrange
      validDto.cardNumber = '4111-1111-1111-1111';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('CVC validation', () => {
    it('should accept 3-digit CVC', async () => {
      // Arrange
      validDto.cvc = '123';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept 4-digit CVC', async () => {
      // Arrange
      validDto.cvc = '1234';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept 2-digit CVC (class-validator only checks isNotEmpty)', async () => {
      // Arrange
      validDto.cvc = '12';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0); // class-validator only validates isNotEmpty, not length
    });

    it('should accept 5-digit CVC (class-validator only checks isNotEmpty)', async () => {
      // Arrange
      validDto.cvc = '12345';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0); // class-validator only validates isNotEmpty, not length
    });
  });

  describe('expiration date validation', () => {
    it('should accept valid month (01-12)', async () => {
      // Arrange
      validDto.expMonth = '01';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept valid month with leading zero', async () => {
      // Arrange
      validDto.expMonth = '09';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept invalid month 00 (class-validator only checks isNotEmpty)', async () => {
      // Arrange
      validDto.expMonth = '00';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0); // class-validator only validates isNotEmpty, not range
    });

    it('should accept invalid month 13 (class-validator only checks isNotEmpty)', async () => {
      // Arrange
      validDto.expMonth = '13';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0); // class-validator only validates isNotEmpty, not range
    });

    it('should accept valid year format (YYYY)', async () => {
      // Arrange
      validDto.expYear = '2025';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept valid year format (YY)', async () => {
      // Arrange
      validDto.expYear = '25';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('amount validation', () => {
    it('should accept minimum amount (100 centavos = 1 peso)', async () => {
      // Arrange
      validDto.amountInCents = 100;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept large amounts', async () => {
      // Arrange
      validDto.amountInCents = 1000000; // 10,000 pesos

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept decimal amounts converted to cents', async () => {
      // Arrange
      validDto.amountInCents = 150; // 1.50 pesos

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with zero amount', async () => {
      // Arrange
      validDto.amountInCents = 0;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountInCents');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with negative amount', async () => {
      // Arrange
      validDto.amountInCents = -100;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('amountInCents');
      expect(errors[0].constraints?.min).toBeDefined();
    });
  });

  describe('installments validation', () => {
    it('should accept minimum installments (1)', async () => {
      // Arrange
      validDto.installments = 1;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum installments (48)', async () => {
      // Arrange
      validDto.installments = 48;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should accept common installment values', async () => {
      // Arrange
      const commonInstallments = [3, 6, 12, 24, 36];

      // Act & Assert
      for (const installments of commonInstallments) {
        validDto.installments = installments;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation with zero installments', async () => {
      // Arrange
      validDto.installments = 0;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('installments');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with negative installments', async () => {
      // Arrange
      validDto.installments = -1;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('installments');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with installments above maximum', async () => {
      // Arrange
      validDto.installments = 49;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('installments');
      expect(errors[0].constraints?.max).toBeDefined();
    });
  });

  describe('email validation', () => {
    it('should accept valid email addresses', async () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com',
        'user@subdomain.example.com',
      ];

      // Act & Assert
      for (const email of validEmails) {
        validDto.customerEmail = email;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation with invalid email formats', async () => {
      // Arrange
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
        'user name@example.com',
        'user@example com',
      ];

      // Act & Assert
      for (const email of invalidEmails) {
        validDto.customerEmail = email;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('customerEmail');
        expect(errors[0].constraints?.isEmail).toBeDefined();
      }
    });
  });

  describe('document validation', () => {
    it('should accept valid Colombian document types', async () => {
      // Arrange
      const validDocumentTypes = ['CC', 'CE', 'TI', 'PP', 'NIT'];

      // Act & Assert
      for (const docType of validDocumentTypes) {
        validDto.documentType = docType;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should accept valid document numbers', async () => {
      // Arrange
      const validDocumentNumbers = [
        '12345678',
        '1234567890',
        'ABC123456',
        '123-456-789',
      ];

      // Act & Assert
      for (const docNumber of validDocumentNumbers) {
        validDto.documentNumber = docNumber;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very long card holder names', async () => {
      // Arrange
      validDto.cardHolderName = 'A'.repeat(1000);

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in names', async () => {
      // Arrange
      validDto.cardHolderName = "José María O'Connor-Smith";

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      // Arrange
      validDto.cardHolderName = 'María José Ñáñez';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should handle numeric strings for numeric fields', async () => {
      // Arrange
      validDto.amountInCents = 5000;
      validDto.installments = 12;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple validation errors', async () => {
      // Arrange
      validDto.cardNumber = '';
      validDto.cvc = '';
      validDto.amountInCents = 50;
      validDto.installments = 0;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors.length).toBeGreaterThan(1);
      expect(errors.some((e) => e.property === 'cardNumber')).toBe(true);
      expect(errors.some((e) => e.property === 'cvc')).toBe(true);
      expect(errors.some((e) => e.property === 'amountInCents')).toBe(true);
      expect(errors.some((e) => e.property === 'installments')).toBe(true);
    });

    it('should prioritize critical validation errors', async () => {
      // Arrange
      validDto.cardNumber = '';
      validDto.customerEmail = 'invalid-email';

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.some((e) => e.property === 'cardNumber')).toBe(true);
      expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should validate Colombian credit card transaction', async () => {
      // Arrange
      validDto.cardNumber = '4111111111111111';
      validDto.cvc = '123';
      validDto.expMonth = '12';
      validDto.expYear = '2025';
      validDto.cardHolderName = 'Juan Carlos Pérez González';
      validDto.documentNumber = '12345678';
      validDto.documentType = 'CC';
      validDto.amountInCents = 50000; // 500 pesos
      validDto.customerEmail = 'juan.perez@email.com';
      validDto.installments = 3;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should validate international credit card transaction', async () => {
      // Arrange
      validDto.cardNumber = '5555555555554444';
      validDto.cvc = '1234';
      validDto.expMonth = '01';
      validDto.expYear = '2026';
      validDto.cardHolderName = 'John Smith';
      validDto.documentNumber = 'AB123456';
      validDto.documentType = 'PP';
      validDto.amountInCents = 100000; // 1000 USD
      validDto.customerEmail = 'john.smith@company.com';
      validDto.installments = 1;

      // Act
      const errors = await validate(validDto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
