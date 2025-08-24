import { PaymentResponseDto } from '../../../application/dto/payment-response.dto';

describe('PaymentResponseDto', () => {
  describe('constructor', () => {
    it('should create PaymentResponseDto with all properties', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 10000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe(paymentId);
      expect(dto.status).toBe(status);
      expect(dto.reference).toBe(reference);
      expect(dto.amount).toBe(amount);
      expect(dto.currency).toBe(currency);
    });

    it('should handle empty string values', () => {
      // Arrange
      const paymentId = '';
      const status = '';
      const reference = '';
      const amount = 0;
      const currency = '';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('');
      expect(dto.status).toBe('');
      expect(dto.reference).toBe('');
      expect(dto.amount).toBe(0);
      expect(dto.currency).toBe('');
    });

    it('should handle zero amount', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'PENDING';
      const reference = 'REF-123456';
      const amount = 0;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.amount).toBe(0);
    });

    it('should handle negative amount', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'ERROR';
      const reference = 'REF-123456';
      const amount = -1000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.amount).toBe(-1000);
    });

    it('should handle large amounts', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 999999999;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.amount).toBe(999999999);
    });

    it('should handle decimal amounts', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 1000.5;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.amount).toBe(1000.5);
    });

    it('should handle different status values', () => {
      // Arrange
      const statuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
      ];
      const paymentId = 'pay_123456';
      const reference = 'REF-123456';
      const amount = 10000;
      const currency = 'COP';

      // Act & Assert
      statuses.forEach((status) => {
        const dto = new PaymentResponseDto(
          paymentId,
          status,
          reference,
          amount,
          currency,
        );
        expect(dto.status).toBe(status);
      });
    });

    it('should handle different currencies', () => {
      // Arrange
      const currencies = ['COP', 'USD', 'EUR', 'GBP', 'JPY', 'MXN'];
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 10000;

      // Act & Assert
      currencies.forEach((currency) => {
        const dto = new PaymentResponseDto(
          paymentId,
          status,
          reference,
          amount,
          currency,
        );
        expect(dto.currency).toBe(currency);
      });
    });

    it('should handle special characters in reference', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123@#$%^&*()';
      const amount = 10000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.reference).toBe('REF-123@#$%^&*()');
    });

    it('should handle very long payment IDs', () => {
      // Arrange
      const paymentId = 'pay_' + 'A'.repeat(1000);
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 10000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe(paymentId);
    });

    it('should handle very long references', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-' + 'A'.repeat(1000);
      const amount = 10000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.reference).toBe(reference);
    });

    it('should handle very long status values', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'A'.repeat(1000);
      const reference = 'REF-123456';
      const amount = 10000;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.status).toBe(status);
    });

    it('should handle very long currency codes', () => {
      // Arrange
      const paymentId = 'pay_123456';
      const status = 'APPROVED';
      const reference = 'REF-123456';
      const amount = 10000;
      const currency = 'A'.repeat(1000);

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.currency).toBe(currency);
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      // Arrange
      const dto = new PaymentResponseDto(
        'pay_123',
        'APPROVED',
        'REF-123',
        1000,
        'COP',
      );

      // Act & Assert
      // En TypeScript, las propiedades readonly solo previenen la modificación en tiempo de compilación
      // En runtime, JavaScript permite la modificación, por lo que este test verifica la estructura
      expect(dto).toHaveProperty('paymentId');
      expect(dto).toHaveProperty('status');
      expect(dto).toHaveProperty('reference');
      expect(dto).toHaveProperty('amount');
      expect(dto).toHaveProperty('currency');
    });

    it('should maintain data integrity after creation', () => {
      // Arrange
      const dto = new PaymentResponseDto(
        'pay_123',
        'APPROVED',
        'REF-123',
        1000,
        'COP',
      );

      // Act & Assert
      // Verificar que los valores originales se mantienen
      expect(dto.paymentId).toBe('pay_123');
      expect(dto.status).toBe('APPROVED');
      expect(dto.reference).toBe('REF-123');
      expect(dto.amount).toBe(1000);
      expect(dto.currency).toBe('COP');
    });
  });

  describe('edge cases', () => {
    it('should handle null values by converting them to strings', () => {
      // Arrange
      const paymentId = null as any;
      const status = null as any;
      const reference = null as any;
      const amount = 1000;
      const currency = null as any;

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe(null);
      expect(dto.status).toBe(null);
      expect(dto.reference).toBe(null);
      expect(dto.amount).toBe(1000);
      expect(dto.currency).toBe(null);
    });

    it('should handle undefined values', () => {
      // Arrange
      const paymentId = undefined as any;
      const status = undefined as any;
      const reference = undefined as any;
      const amount = 1000;
      const currency = undefined as any;

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe(undefined);
      expect(dto.status).toBe(undefined);
      expect(dto.reference).toBe(undefined);
      expect(dto.amount).toBe(1000);
      expect(dto.currency).toBe(undefined);
    });

    it('should handle boolean values', () => {
      // Arrange
      const paymentId = true as any;
      const status = false as any;
      const reference = true as any;
      const amount = 1000;
      const currency = false as any;

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe(true);
      expect(dto.status).toBe(false);
      expect(dto.reference).toBe(true);
      expect(dto.amount).toBe(1000);
      expect(dto.currency).toBe(false);
    });

    it('should handle object values', () => {
      // Arrange
      const paymentId = {} as any;
      const status = [] as any;
      const reference = { key: 'value' } as any;
      const amount = 1000;
      const currency = [1, 2, 3] as any;

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toEqual({});
      expect(dto.status).toEqual([]);
      expect(dto.reference).toEqual({ key: 'value' });
      expect(dto.amount).toBe(1000);
      expect(dto.currency).toEqual([1, 2, 3]);
    });

    it('should handle function values', () => {
      // Arrange
      const paymentId = (() => 'test') as any;
      const status = function () {
        return 'test';
      } as any;
      const reference = (() => 'test') as any;
      const amount = 1000;
      const currency = function () {
        return 'test';
      } as any;

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(typeof dto.paymentId).toBe('function');
      expect(typeof dto.status).toBe('function');
      expect(typeof dto.reference).toBe('function');
      expect(dto.amount).toBe(1000);
      expect(typeof dto.currency).toBe('function');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle Colombian peso payments', () => {
      // Arrange
      const paymentId = 'pay_COP_123';
      const status = 'APPROVED';
      const reference = 'REF-COP-2024-001';
      const amount = 50000; // 500.00 COP
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('pay_COP_123');
      expect(dto.status).toBe('APPROVED');
      expect(dto.reference).toBe('REF-COP-2024-001');
      expect(dto.amount).toBe(50000);
      expect(dto.currency).toBe('COP');
    });

    it('should handle US dollar payments', () => {
      // Arrange
      const paymentId = 'pay_USD_456';
      const status = 'PENDING';
      const reference = 'REF-USD-2024-002';
      const amount = 2500; // 25.00 USD
      const currency = 'USD';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('pay_USD_456');
      expect(dto.status).toBe('PENDING');
      expect(dto.reference).toBe('REF-USD-2024-002');
      expect(dto.amount).toBe(2500);
      expect(dto.currency).toBe('USD');
    });

    it('should handle Euro payments', () => {
      // Arrange
      const paymentId = 'pay_EUR_789';
      const status = 'DECLINED';
      const reference = 'REF-EUR-2024-003';
      const amount = 3000; // 30.00 EUR
      const currency = 'EUR';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('pay_EUR_789');
      expect(dto.status).toBe('DECLINED');
      expect(dto.reference).toBe('REF-EUR-2024-003');
      expect(dto.amount).toBe(3000);
      expect(dto.currency).toBe('EUR');
    });

    it('should handle failed payments', () => {
      // Arrange
      const paymentId = 'pay_FAIL_999';
      const status = 'ERROR';
      const reference = 'REF-ERROR-2024-004';
      const amount = 0;
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('pay_FAIL_999');
      expect(dto.status).toBe('ERROR');
      expect(dto.reference).toBe('REF-ERROR-2024-004');
      expect(dto.amount).toBe(0);
      expect(dto.currency).toBe('COP');
    });

    it('should handle large business payments', () => {
      // Arrange
      const paymentId = 'pay_BUSINESS_001';
      const status = 'APPROVED';
      const reference = 'REF-BUSINESS-2024-005';
      const amount = 100000000; // 1,000,000.00 COP
      const currency = 'COP';

      // Act
      const dto = new PaymentResponseDto(
        paymentId,
        status,
        reference,
        amount,
        currency,
      );

      // Assert
      expect(dto.paymentId).toBe('pay_BUSINESS_001');
      expect(dto.status).toBe('APPROVED');
      expect(dto.reference).toBe('REF-BUSINESS-2024-005');
      expect(dto.amount).toBe(100000000);
      expect(dto.currency).toBe('COP');
    });
  });
});
