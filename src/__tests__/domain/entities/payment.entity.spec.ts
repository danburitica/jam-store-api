import {
  Payment,
  PaymentStatus,
  CustomerData,
  PaymentMethod,
} from '../../../domain/entities/payment.entity';

describe('Payment Entity', () => {
  const mockCustomerData: CustomerData = {
    fullName: 'Juan Pérez',
    legalId: '12345678',
    legalIdType: 'CC',
  };

  const mockPaymentMethod: PaymentMethod = {
    type: 'card',
    token: 'tok_test_123',
    installments: 1,
  };

  const mockAcceptanceToken = 'acceptance_token_123';
  const mockSignature = 'signature_123';

  describe('create', () => {
    it('should create a payment with correct default values', () => {
      const amount = 10000;
      const currency = 'COP';
      const reference = 'REF-123';
      const customerEmail = 'test@example.com';

      const payment = Payment.create(
        amount,
        currency,
        reference,
        customerEmail,
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      expect(payment.amount).toBe(amount);
      expect(payment.currency).toBe(currency);
      expect(payment.reference).toBe(reference);
      expect(payment.customerEmail).toBe(customerEmail);
      expect(payment.customerData).toEqual(mockCustomerData);
      expect(payment.paymentMethod).toEqual(mockPaymentMethod);
      expect(payment.acceptanceToken).toBe(mockAcceptanceToken);
      expect(payment.signature).toBe(mockSignature);
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.id).toBeDefined();
      expect(payment.id.length).toBeGreaterThan(0);
      expect(payment.createdAt).toBeInstanceOf(Date);
      expect(payment.updatedAt).toBeInstanceOf(Date);
      expect(payment.createdAt.getTime()).toBe(payment.updatedAt.getTime());
    });

    it('should generate unique IDs for different payments', () => {
      const payment1 = Payment.create(
        1000,
        'COP',
        'REF-1',
        'test1@example.com',
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      const payment2 = Payment.create(
        2000,
        'COP',
        'REF-2',
        'test2@example.com',
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      expect(payment1.id).not.toBe(payment2.id);
    });

    it('should handle zero amount', () => {
      const payment = Payment.create(
        0,
        'COP',
        'REF-ZERO',
        'test@example.com',
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      expect(payment.amount).toBe(0);
    });

    it('should handle large amounts', () => {
      const largeAmount = 999999999;
      const payment = Payment.create(
        largeAmount,
        'COP',
        'REF-LARGE',
        'test@example.com',
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      expect(payment.amount).toBe(largeAmount);
    });
  });

  describe('updateStatus', () => {
    let payment: Payment;

    beforeEach(() => {
      payment = Payment.create(
        10000,
        'COP',
        'REF-TEST',
        'test@example.com',
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );
    });

    it('should update status to APPROVED', () => {
      const updatedPayment = payment.updateStatus(PaymentStatus.APPROVED);

      expect(updatedPayment.status).toBe(PaymentStatus.APPROVED);
      expect(updatedPayment.id).toBe(payment.id);
      expect(updatedPayment.amount).toBe(payment.amount);
      expect(updatedPayment.currency).toBe(payment.currency);
      expect(updatedPayment.reference).toBe(payment.reference);
      expect(updatedPayment.customerEmail).toBe(payment.customerEmail);
      expect(updatedPayment.customerData).toEqual(payment.customerData);
      expect(updatedPayment.paymentMethod).toEqual(payment.paymentMethod);
      expect(updatedPayment.acceptanceToken).toBe(payment.acceptanceToken);
      expect(updatedPayment.signature).toBe(payment.signature);
      expect(updatedPayment.createdAt).toEqual(payment.createdAt);
      expect(updatedPayment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        payment.updatedAt.getTime(),
      );
    });

    it('should update status to DECLINED', () => {
      const updatedPayment = payment.updateStatus(PaymentStatus.DECLINED);

      expect(updatedPayment.status).toBe(PaymentStatus.DECLINED);
      expect(updatedPayment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        payment.updatedAt.getTime(),
      );
    });

    it('should update status to ERROR', () => {
      const updatedPayment = payment.updateStatus(PaymentStatus.ERROR);

      expect(updatedPayment.status).toBe(PaymentStatus.ERROR);
      expect(updatedPayment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        payment.updatedAt.getTime(),
      );
    });

    it('should return a new instance, not modify the original', () => {
      const originalStatus = payment.status;
      const originalUpdatedAt = payment.updatedAt;

      const updatedPayment = payment.updateStatus(PaymentStatus.APPROVED);

      expect(payment.status).toBe(originalStatus);
      expect(payment.updatedAt).toEqual(originalUpdatedAt);
      expect(updatedPayment).not.toBe(payment);
    });
  });

  describe('constructor', () => {
    it('should create payment with all provided values', () => {
      const id = 'PAY-123';
      const amount = 5000;
      const currency = 'USD';
      const reference = 'REF-USD';
      const status = PaymentStatus.APPROVED;
      const customerEmail = 'usd@example.com';
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');

      const payment = new Payment(
        id,
        amount,
        currency,
        reference,
        status,
        customerEmail,
        mockCustomerData,
        mockPaymentMethod,
        mockAcceptanceToken,
        mockSignature,
        createdAt,
        updatedAt,
      );

      expect(payment.id).toBe(id);
      expect(payment.amount).toBe(amount);
      expect(payment.currency).toBe(currency);
      expect(payment.reference).toBe(reference);
      expect(payment.status).toBe(status);
      expect(payment.customerEmail).toBe(customerEmail);
      expect(payment.createdAt).toEqual(createdAt);
      expect(payment.updatedAt).toEqual(updatedAt);
    });
  });

  describe('PaymentStatus enum', () => {
    it('should have all required status values', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
      expect(PaymentStatus.APPROVED).toBe('APPROVED');
      expect(PaymentStatus.DECLINED).toBe('DECLINED');
      expect(PaymentStatus.ERROR).toBe('ERROR');
    });
  });

  describe('interfaces', () => {
    it('should validate CustomerData interface structure', () => {
      const customerData: CustomerData = {
        fullName: 'Test User',
        legalId: '87654321',
        legalIdType: 'CE',
      };

      expect(customerData.fullName).toBeDefined();
      expect(customerData.legalId).toBeDefined();
      expect(customerData.legalIdType).toBeDefined();
    });

    it('should validate PaymentMethod interface structure', () => {
      const paymentMethod: PaymentMethod = {
        type: 'debit',
        token: 'tok_debit_123',
        installments: 3,
      };

      expect(paymentMethod.type).toBeDefined();
      expect(paymentMethod.token).toBeDefined();
      expect(paymentMethod.installments).toBeDefined();
    });
  });
});
