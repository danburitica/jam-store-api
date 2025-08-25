import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentTransactionUseCase } from '../../../application/use-cases/create-payment-transaction.use-case';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import { PaymentTransactionRequest } from '../../../domain/entities/payment.entity';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

describe('CreatePaymentTransactionUseCase', () => {
  let useCase: CreatePaymentTransactionUseCase;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;

  const mockTransactionData: PaymentTransactionRequest = {
    acceptanceToken: 'acceptance_token_123',
    amountInCents: 10000,
    currency: 'COP',
    signature: 'signature_123',
    customerEmail: 'test@example.com',
    paymentMethod: {
      type: 'card',
      token: 'tok_test_123',
      installments: 1,
    },
    reference: 'REF-123456',
    customerData: {
      fullName: 'Juan Pérez',
      legalId: '12345678',
      legalIdType: 'CC',
    },
  };

  const mockTransactionResult = {
    id: 'txn_123456',
    status: 'PENDING',
  };

  beforeEach(async () => {
    const mockPaymentGatewayServiceImpl = {
      createTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentTransactionUseCase,
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockPaymentGatewayServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<CreatePaymentTransactionUseCase>(
      CreatePaymentTransactionUseCase,
    );
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create payment transaction successfully and return transaction result', async () => {
      // Arrange
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(mockTransactionData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        mockTransactionData,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle different amounts correctly', async () => {
      // Arrange
      const differentAmountData = {
        ...mockTransactionData,
        amountInCents: 5000,
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentAmountData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentAmountData,
      );
    });

    it('should handle zero amount correctly', async () => {
      // Arrange
      const zeroAmountData = { ...mockTransactionData, amountInCents: 0 };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(zeroAmountData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        zeroAmountData,
      );
    });

    it('should handle large amounts correctly', async () => {
      // Arrange
      const largeAmountData = {
        ...mockTransactionData,
        amountInCents: 999999999,
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(largeAmountData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        largeAmountData,
      );
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdData = { ...mockTransactionData, currency: 'USD' };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(usdData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        usdData,
      );
    });

    it('should handle different payment method types correctly', async () => {
      // Arrange
      const debitData = {
        ...mockTransactionData,
        paymentMethod: { ...mockTransactionData.paymentMethod, type: 'debit' },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(debitData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        debitData,
      );
    });

    it('should handle different installments correctly', async () => {
      // Arrange
      const multipleInstallmentsData = {
        ...mockTransactionData,
        paymentMethod: {
          ...mockTransactionData.paymentMethod,
          installments: 12,
        },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(multipleInstallmentsData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        multipleInstallmentsData,
      );
    });

    it('should handle different customer data correctly', async () => {
      // Arrange
      const differentCustomerData = {
        ...mockTransactionData,
        customerData: {
          fullName: 'María García',
          legalId: '87654321',
          legalIdType: 'CE',
        },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentCustomerData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentCustomerData,
      );
    });

    it('should handle different acceptance tokens correctly', async () => {
      // Arrange
      const differentTokenData = {
        ...mockTransactionData,
        acceptanceToken: 'different_token_456',
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentTokenData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentTokenData,
      );
    });

    it('should handle different signatures correctly', async () => {
      // Arrange
      const differentSignatureData = {
        ...mockTransactionData,
        signature: 'different_signature_456',
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentSignatureData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentSignatureData,
      );
    });

    it('should handle different references correctly', async () => {
      // Arrange
      const differentReferenceData = {
        ...mockTransactionData,
        reference: 'REF-DIFFERENT-789',
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentReferenceData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentReferenceData,
      );
    });

    it('should handle different customer emails correctly', async () => {
      // Arrange
      const differentEmailData = {
        ...mockTransactionData,
        customerEmail: 'different@example.com',
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(differentEmailData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        differentEmailData,
      );
    });

    it('should handle empty acceptance token', async () => {
      // Arrange
      const emptyTokenData = { ...mockTransactionData, acceptanceToken: '' };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(emptyTokenData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        emptyTokenData,
      );
    });

    it('should handle empty signature', async () => {
      // Arrange
      const emptySignatureData = { ...mockTransactionData, signature: '' };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(emptySignatureData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        emptySignatureData,
      );
    });

    it('should handle empty reference', async () => {
      // Arrange
      const emptyReferenceData = { ...mockTransactionData, reference: '' };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(emptyReferenceData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        emptyReferenceData,
      );
    });

    it('should handle empty customer email', async () => {
      // Arrange
      const emptyEmailData = { ...mockTransactionData, customerEmail: '' };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(emptyEmailData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        emptyEmailData,
      );
    });

    it('should handle negative amounts correctly', async () => {
      // Arrange
      const negativeAmountData = {
        ...mockTransactionData,
        amountInCents: -1000,
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(negativeAmountData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        negativeAmountData,
      );
    });

    it('should handle decimal amounts correctly', async () => {
      // Arrange
      const decimalAmountData = {
        ...mockTransactionData,
        amountInCents: 1000.5,
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(decimalAmountData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        decimalAmountData,
      );
    });

    it('should handle zero installments correctly', async () => {
      // Arrange
      const zeroInstallmentsData = {
        ...mockTransactionData,
        paymentMethod: {
          ...mockTransactionData.paymentMethod,
          installments: 0,
        },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(zeroInstallmentsData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        zeroInstallmentsData,
      );
    });

    it('should handle negative installments correctly', async () => {
      // Arrange
      const negativeInstallmentsData = {
        ...mockTransactionData,
        paymentMethod: {
          ...mockTransactionData.paymentMethod,
          installments: -1,
        },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(negativeInstallmentsData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        negativeInstallmentsData,
      );
    });

    it('should handle decimal installments correctly', async () => {
      // Arrange
      const decimalInstallmentsData = {
        ...mockTransactionData,
        paymentMethod: {
          ...mockTransactionData.paymentMethod,
          installments: 1.5,
        },
      };
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(decimalInstallmentsData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        decimalInstallmentsData,
      );
    });

    it('should propagate errors from payment gateway service', async () => {
      // Arrange
      const mockError = new Error('Payment gateway service error');
      mockPaymentGatewayService.createTransaction.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockTransactionData)).rejects.toThrow(
        mockError,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        mockTransactionData,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle network errors from payment gateway service', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockPaymentGatewayService.createTransaction.mockRejectedValue(
        networkError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionData)).rejects.toThrow(
        networkError,
      );
    });

    it('should handle validation errors from payment gateway service', async () => {
      // Arrange
      const validationError = new Error('Invalid transaction data');
      mockPaymentGatewayService.createTransaction.mockRejectedValue(
        validationError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionData)).rejects.toThrow(
        validationError,
      );
    });

    it('should handle authentication errors from payment gateway service', async () => {
      // Arrange
      const authError = new Error('Invalid API key');
      mockPaymentGatewayService.createTransaction.mockRejectedValue(authError);

      // Act & Assert
      await expect(useCase.execute(mockTransactionData)).rejects.toThrow(
        authError,
      );
    });

    it('should handle rate limit errors from payment gateway service', async () => {
      // Arrange
      const rateLimitError = new Error('Rate limit exceeded');
      mockPaymentGatewayService.createTransaction.mockRejectedValue(
        rateLimitError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionData)).rejects.toThrow(
        rateLimitError,
      );
    });

    it('should handle different transaction result statuses', async () => {
      // Arrange
      const differentStatuses = ['APPROVED', 'DECLINED', 'ERROR', 'CANCELLED'];

      for (const status of differentStatuses) {
        const differentResult = { ...mockTransactionResult, status };
        mockPaymentGatewayService.createTransaction.mockResolvedValue(
          differentResult,
        );

        // Act
        const result = await useCase.execute(mockTransactionData);

        // Assert
        expect(result.status).toBe(status);
      }
    });

    it('should handle different transaction result IDs', async () => {
      // Arrange
      const differentIds = ['txn_111', 'txn_222', 'txn_333', 'txn_444'];

      for (const id of differentIds) {
        const differentResult = { ...mockTransactionResult, id };
        mockPaymentGatewayService.createTransaction.mockResolvedValue(
          differentResult,
        );

        // Act
        const result = await useCase.execute(mockTransactionData);

        // Assert
        expect(result.id).toBe(id);
      }
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world transaction data examples', async () => {
      // Arrange
      const realWorldTransactions = [
        {
          acceptanceToken: 'acceptance_token_visa',
          amountInCents: 25000, // 250.00 COP
          currency: 'COP',
          signature: 'signature_visa_123',
          customerEmail: 'visa@example.com',
          paymentMethod: {
            type: 'credit_card',
            token: 'tok_visa_123',
            installments: 3,
          },
          reference: 'REF-VISA-2024-001',
          customerData: {
            fullName: 'John Doe',
            legalId: '12345678',
            legalIdType: 'CC',
          },
        },
        {
          acceptanceToken: 'acceptance_token_mastercard',
          amountInCents: 50000, // 500.00 COP
          currency: 'COP',
          signature: 'signature_mastercard_456',
          customerEmail: 'mastercard@example.com',
          paymentMethod: {
            type: 'debit_card',
            token: 'tok_mastercard_456',
            installments: 1,
          },
          reference: 'REF-MASTERCARD-2024-002',
          customerData: {
            fullName: 'Jane Smith',
            legalId: '87654321',
            legalIdType: 'CE',
          },
        },
        {
          acceptanceToken: 'acceptance_token_amex',
          amountInCents: 75000, // 750.00 COP
          currency: 'COP',
          signature: 'signature_amex_789',
          customerEmail: 'amex@example.com',
          paymentMethod: {
            type: 'credit_card',
            token: 'tok_amex_789',
            installments: 6,
          },
          reference: 'REF-AMEX-2024-003',
          customerData: {
            fullName: 'Bob Johnson',
            legalId: '11223344',
            legalIdType: 'TI',
          },
        },
      ];

      for (const transactionData of realWorldTransactions) {
        mockPaymentGatewayService.createTransaction.mockResolvedValue(
          mockTransactionResult,
        );

        // Act
        const result = await useCase.execute(transactionData);

        // Assert
        expect(result).toEqual(mockTransactionResult);
        expect(
          mockPaymentGatewayService.createTransaction,
        ).toHaveBeenCalledWith(transactionData);
      }
    });

    it('should handle multiple consecutive calls correctly', async () => {
      // Arrange
      const multipleTransactions = Array.from({ length: 5 }, (_, i) => ({
        ...mockTransactionData,
        reference: `${mockTransactionData.reference}-${i}`,
        amountInCents: mockTransactionData.amountInCents + i * 1000,
      }));

      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const results = await Promise.all(
        multipleTransactions.map((transactionData) =>
          useCase.execute(transactionData),
        ),
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach((result) =>
        expect(result).toEqual(mockTransactionResult),
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledTimes(
        5,
      );
    });

    it('should handle edge case of minimum transaction data', async () => {
      // Arrange
      const minimalTransactionData: PaymentTransactionRequest = {
        acceptanceToken: '1',
        amountInCents: 1,
        currency: '1',
        signature: '1',
        customerEmail: '1@1.1',
        paymentMethod: {
          type: '1',
          token: '1',
          installments: 1,
        },
        reference: '1',
        customerData: {
          fullName: '1',
          legalId: '1',
          legalIdType: '1',
        },
      };

      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(minimalTransactionData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        minimalTransactionData,
      );
    });

    it('should handle edge case of maximum transaction data', async () => {
      // Arrange
      const maximalTransactionData: PaymentTransactionRequest = {
        acceptanceToken: 'A'.repeat(1000),
        amountInCents: 999999999,
        currency: 'A'.repeat(1000),
        signature: 'A'.repeat(1000),
        customerEmail: 'A'.repeat(1000) + '@' + 'A'.repeat(1000) + '.com',
        paymentMethod: {
          type: 'A'.repeat(1000),
          token: 'A'.repeat(1000),
          installments: 999999999,
        },
        reference: 'A'.repeat(1000),
        customerData: {
          fullName: 'A'.repeat(1000),
          legalId: 'A'.repeat(1000),
          legalIdType: 'A'.repeat(1000),
        },
      };

      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await useCase.execute(maximalTransactionData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith(
        maximalTransactionData,
      );
    });
  });
});
