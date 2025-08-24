import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../../../infrastructure/controllers/payment.controller';
import { ProcessPaymentUseCase } from '../../../application/use-cases/process-payment.use-case';
import { GetAcceptanceTokenUseCase } from '../../../application/use-cases/get-acceptance-token.use-case';
import { CreateCardTokenUseCase } from '../../../application/use-cases/create-card-token.use-case';
import { CreatePaymentTransactionUseCase } from '../../../application/use-cases/create-payment-transaction.use-case';
import { GetTransactionStatusUseCase } from '../../../application/use-cases/get-transaction-status.use-case';
import {
  CreatePaymentDto,
  CustomerDataDto,
  PaymentMethodDto,
} from '../../../application/dto/create-payment.dto';
import { PaymentResponseDto } from '../../../application/dto/payment-response.dto';
import { CardTokenRequest } from '../../../domain/entities/payment.entity';

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockProcessPaymentUseCase: jest.Mocked<ProcessPaymentUseCase>;
  let mockGetAcceptanceTokenUseCase: jest.Mocked<GetAcceptanceTokenUseCase>;
  let mockCreateCardTokenUseCase: jest.Mocked<CreateCardTokenUseCase>;
  let mockCreatePaymentTransactionUseCase: jest.Mocked<CreatePaymentTransactionUseCase>;
  let mockGetTransactionStatusUseCase: jest.Mocked<GetTransactionStatusUseCase>;

  const mockCreatePaymentDto: CreatePaymentDto = {
    amountInCents: 10000,
    currency: 'COP',
    reference: 'REF-123456',
    customerEmail: 'test@example.com',
    customerData: {
      fullName: 'Juan Pérez',
      legalId: '12345678',
      legalIdType: 'CC',
    } as CustomerDataDto,
    paymentMethod: {
      type: 'card',
      token: 'tok_test_123',
      installments: 1,
    } as PaymentMethodDto,
  };

  const mockPaymentResponseDto = new PaymentResponseDto(
    'pay_123456',
    'APPROVED',
    'REF-123456',
    10000,
    'COP',
  );

  const mockAcceptanceToken = 'acceptance_token_123';
  const mockCardToken = 'tok_test_123';
  const mockTransactionResult = { id: 'txn_123456', status: 'PENDING' };
  const mockTransactionStatus = 'APPROVED';

  beforeEach(async () => {
    const mockProcessPaymentUseCaseImpl = {
      execute: jest.fn(),
    };

    const mockGetAcceptanceTokenUseCaseImpl = {
      execute: jest.fn(),
    };

    const mockCreateCardTokenUseCaseImpl = {
      execute: jest.fn(),
    };

    const mockCreatePaymentTransactionUseCaseImpl = {
      execute: jest.fn(),
    };

    const mockGetTransactionStatusUseCaseImpl = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ProcessPaymentUseCase,
          useValue: mockProcessPaymentUseCaseImpl,
        },
        {
          provide: GetAcceptanceTokenUseCase,
          useValue: mockGetAcceptanceTokenUseCaseImpl,
        },
        {
          provide: CreateCardTokenUseCase,
          useValue: mockCreateCardTokenUseCaseImpl,
        },
        {
          provide: CreatePaymentTransactionUseCase,
          useValue: mockCreatePaymentTransactionUseCaseImpl,
        },
        {
          provide: GetTransactionStatusUseCase,
          useValue: mockGetTransactionStatusUseCaseImpl,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    mockProcessPaymentUseCase = module.get(ProcessPaymentUseCase);
    mockGetAcceptanceTokenUseCase = module.get(GetAcceptanceTokenUseCase);
    mockCreateCardTokenUseCase = module.get(CreateCardTokenUseCase);
    mockCreatePaymentTransactionUseCase = module.get(
      CreatePaymentTransactionUseCase,
    );
    mockGetTransactionStatusUseCase = module.get(GetTransactionStatusUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment successfully and return PaymentResponseDto', async () => {
      // Arrange
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(mockCreatePaymentDto);

      // Assert
      expect(result).toBe(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        mockCreatePaymentDto,
      );
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different payment amounts correctly', async () => {
      // Arrange
      const differentAmountDto = {
        ...mockCreatePaymentDto,
        amountInCents: 5000,
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(differentAmountDto);

      // Assert
      expect(result).toBe(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        differentAmountDto,
      );
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdDto = { ...mockCreatePaymentDto, currency: 'USD' };
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(usdDto);

      // Assert
      expect(result).toBe(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(usdDto);
    });

    it('should handle different customer data correctly', async () => {
      // Arrange
      const differentCustomerDto = {
        ...mockCreatePaymentDto,
        customerData: {
          fullName: 'María García',
          legalId: '87654321',
          legalIdType: 'CE',
        } as CustomerDataDto,
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(differentCustomerDto);

      // Assert
      expect(result).toBe(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        differentCustomerDto,
      );
    });

    it('should handle different payment methods correctly', async () => {
      // Arrange
      const differentPaymentMethodDto = {
        ...mockCreatePaymentDto,
        paymentMethod: {
          type: 'debit',
          token: 'tok_debit_123',
          installments: 3,
        } as PaymentMethodDto,
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(differentPaymentMethodDto);

      // Assert
      expect(result).toBe(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        differentPaymentMethodDto,
      );
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockError = new Error('Payment processing error');
      mockProcessPaymentUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        controller.processPayment(mockCreatePaymentDto),
      ).rejects.toThrow(mockError);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        mockCreatePaymentDto,
      );
    });

    it('should handle validation errors from use case', async () => {
      // Arrange
      const validationError = new Error('Validation error');
      mockProcessPaymentUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(
        controller.processPayment(mockCreatePaymentDto),
      ).rejects.toThrow(validationError);
    });

    it('should handle network errors from use case', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockProcessPaymentUseCase.execute.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        controller.processPayment(mockCreatePaymentDto),
      ).rejects.toThrow(networkError);
    });
  });

  describe('getAcceptanceToken', () => {
    it('should get acceptance token successfully and return object with token', async () => {
      // Arrange
      mockGetAcceptanceTokenUseCase.execute.mockResolvedValue(
        mockAcceptanceToken,
      );

      // Act
      const result = await controller.getAcceptanceToken();

      // Assert
      expect(result).toEqual({ acceptanceToken: mockAcceptanceToken });
      expect(mockGetAcceptanceTokenUseCase.execute).toHaveBeenCalledWith();
      expect(mockGetAcceptanceTokenUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different token formats correctly', async () => {
      // Arrange
      const differentTokens = [
        'acceptance_token_123',
        'token_456',
        'acc_789',
        'acceptance_012',
        'tok_345',
      ];

      for (const token of differentTokens) {
        mockGetAcceptanceTokenUseCase.execute.mockResolvedValue(token);

        // Act
        const result = await controller.getAcceptanceToken();

        // Assert
        expect(result).toEqual({ acceptanceToken: token });
        expect(mockGetAcceptanceTokenUseCase.execute).toHaveBeenCalledWith();
      }
    });

    it('should handle empty token correctly', async () => {
      // Arrange
      const emptyToken = '';
      mockGetAcceptanceTokenUseCase.execute.mockResolvedValue(emptyToken);

      // Act
      const result = await controller.getAcceptanceToken();

      // Assert
      expect(result).toEqual({ acceptanceToken: '' });
      expect(mockGetAcceptanceTokenUseCase.execute).toHaveBeenCalledWith();
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockError = new Error('Token retrieval error');
      mockGetAcceptanceTokenUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.getAcceptanceToken()).rejects.toThrow(mockError);
      expect(mockGetAcceptanceTokenUseCase.execute).toHaveBeenCalledWith();
    });

    it('should handle network errors from use case', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockGetAcceptanceTokenUseCase.execute.mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.getAcceptanceToken()).rejects.toThrow(
        networkError,
      );
    });
  });

  describe('createCardToken', () => {
    const mockCardData: CardTokenRequest = {
      number: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2025',
      cardHolder: 'Juan Pérez',
    };

    it('should create card token successfully and return object with token', async () => {
      // Arrange
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);

      // Act
      const result = await controller.createCardToken(mockCardData);

      // Assert
      expect(result).toEqual({ token: mockCardToken });
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        mockCardData,
      );
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different card data correctly', async () => {
      // Arrange
      const differentCardData = { ...mockCardData, number: '5555555555554444' };
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);

      // Act
      const result = await controller.createCardToken(differentCardData);

      // Assert
      expect(result).toEqual({ token: mockCardToken });
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        differentCardData,
      );
    });

    it('should handle different CVC values correctly', async () => {
      // Arrange
      const differentCvcData = { ...mockCardData, cvc: '999' };
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);

      // Act
      const result = await controller.createCardToken(differentCvcData);

      // Assert
      expect(result).toEqual({ token: mockCardToken });
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        differentCvcData,
      );
    });

    it('should handle different expiration dates correctly', async () => {
      // Arrange
      const differentExpData = {
        ...mockCardData,
        expMonth: '01',
        expYear: '2030',
      };
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);

      // Act
      const result = await controller.createCardToken(differentExpData);

      // Assert
      expect(result).toEqual({ token: mockCardToken });
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        differentExpData,
      );
    });

    it('should handle different card holder names correctly', async () => {
      // Arrange
      const differentHolderData = {
        ...mockCardData,
        cardHolder: 'María García',
      };
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);

      // Act
      const result = await controller.createCardToken(differentHolderData);

      // Assert
      expect(result).toEqual({ token: mockCardToken });
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        differentHolderData,
      );
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockError = new Error('Card token creation error');
      mockCreateCardTokenUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.createCardToken(mockCardData)).rejects.toThrow(
        mockError,
      );
      expect(mockCreateCardTokenUseCase.execute).toHaveBeenCalledWith(
        mockCardData,
      );
    });

    it('should handle validation errors from use case', async () => {
      // Arrange
      const validationError = new Error('Invalid card data');
      mockCreateCardTokenUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.createCardToken(mockCardData)).rejects.toThrow(
        validationError,
      );
    });
  });

  describe('createTransaction', () => {
    const mockTransactionData = {
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

    it('should create transaction successfully and return transaction result', async () => {
      // Arrange
      mockCreatePaymentTransactionUseCase.execute.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await controller.createTransaction(mockTransactionData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledWith(
        mockTransactionData,
      );
      expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle different transaction data correctly', async () => {
      // Arrange
      const differentTransactionData = {
        ...mockTransactionData,
        amountInCents: 5000,
      };
      mockCreatePaymentTransactionUseCase.execute.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await controller.createTransaction(
        differentTransactionData,
      );

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledWith(
        differentTransactionData,
      );
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdTransactionData = { ...mockTransactionData, currency: 'USD' };
      mockCreatePaymentTransactionUseCase.execute.mockResolvedValue(
        mockTransactionResult,
      );

      // Act
      const result = await controller.createTransaction(usdTransactionData);

      // Assert
      expect(result).toEqual(mockTransactionResult);
      expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledWith(
        usdTransactionData,
      );
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockError = new Error('Transaction creation error');
      mockCreatePaymentTransactionUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockTransactionData),
      ).rejects.toThrow(mockError);
      expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledWith(
        mockTransactionData,
      );
    });

    it('should handle validation errors from use case', async () => {
      // Arrange
      const validationError = new Error('Invalid transaction data');
      mockCreatePaymentTransactionUseCase.execute.mockRejectedValue(
        validationError,
      );

      // Act & Assert
      await expect(
        controller.createTransaction(mockTransactionData),
      ).rejects.toThrow(validationError);
    });
  });

  describe('getTransactionStatus', () => {
    const mockTransactionId = 'txn_123456';

    it('should get transaction status successfully and return object with status', async () => {
      // Arrange
      mockGetTransactionStatusUseCase.execute.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await controller.getTransactionStatus(mockTransactionId);

      // Assert
      expect(result).toEqual({ status: mockTransactionStatus });
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        mockTransactionId,
      );
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different transaction IDs correctly', async () => {
      // Arrange
      const differentTransactionIds = [
        'txn_111111',
        'txn_222222',
        'txn_333333',
        'txn_444444',
        'txn_555555',
      ];

      for (const transactionId of differentTransactionIds) {
        mockGetTransactionStatusUseCase.execute.mockResolvedValue(
          mockTransactionStatus,
        );

        // Act
        const result = await controller.getTransactionStatus(transactionId);

        // Assert
        expect(result).toEqual({ status: mockTransactionStatus });
        expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
          transactionId,
        );
      }
    });

    it('should handle different status values correctly', async () => {
      // Arrange
      const differentStatuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
      ];

      for (const status of differentStatuses) {
        mockGetTransactionStatusUseCase.execute.mockResolvedValue(status);

        // Act
        const result = await controller.getTransactionStatus(mockTransactionId);

        // Assert
        expect(result).toEqual({ status });
        expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
          mockTransactionId,
        );
      }
    });

    it('should handle empty transaction ID correctly', async () => {
      // Arrange
      const emptyTransactionId = '';
      mockGetTransactionStatusUseCase.execute.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await controller.getTransactionStatus(emptyTransactionId);

      // Assert
      expect(result).toEqual({ status: mockTransactionStatus });
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        emptyTransactionId,
      );
    });

    it('should handle very long transaction IDs correctly', async () => {
      // Arrange
      const longTransactionId = 'txn_' + 'A'.repeat(1000);
      mockGetTransactionStatusUseCase.execute.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await controller.getTransactionStatus(longTransactionId);

      // Assert
      expect(result).toEqual({ status: mockTransactionStatus });
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        longTransactionId,
      );
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockError = new Error('Transaction status retrieval error');
      mockGetTransactionStatusUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        controller.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow(mockError);
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        mockTransactionId,
      );
    });

    it('should handle not found errors from use case', async () => {
      // Arrange
      const notFoundError = new Error('Transaction not found');
      mockGetTransactionStatusUseCase.execute.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(
        controller.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow(notFoundError);
    });

    it('should handle network errors from use case', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockGetTransactionStatusUseCase.execute.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        controller.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow(networkError);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete payment flow correctly', async () => {
      // Arrange
      mockGetAcceptanceTokenUseCase.execute.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockCreateCardTokenUseCase.execute.mockResolvedValue(mockCardToken);
      mockCreatePaymentTransactionUseCase.execute.mockResolvedValue(
        mockTransactionResult,
      );
      mockGetTransactionStatusUseCase.execute.mockResolvedValue(
        mockTransactionStatus,
      );
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const acceptanceToken = await controller.getAcceptanceToken();
      const cardToken = await controller.createCardToken({
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Juan Pérez',
      });
      const transaction = await controller.createTransaction({
        acceptanceToken: acceptanceToken.acceptanceToken,
        amountInCents: 10000,
        currency: 'COP',
        signature: 'signature_123',
        customerEmail: 'test@example.com',
        paymentMethod: {
          type: 'card',
          token: cardToken.token,
          installments: 1,
        },
        reference: 'REF-123456',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
      });
      const status = await controller.getTransactionStatus(transaction.id);
      const payment = await controller.processPayment(mockCreatePaymentDto);

      // Assert
      expect(acceptanceToken).toEqual({ acceptanceToken: mockAcceptanceToken });
      expect(cardToken).toEqual({ token: mockCardToken });
      expect(transaction).toEqual(mockTransactionResult);
      expect(status).toEqual({ status: mockTransactionStatus });
      expect(payment).toEqual(mockPaymentResponseDto);
    });

    it('should handle multiple concurrent requests correctly', async () => {
      // Arrange
      const multipleRequests = Array.from({ length: 5 }, (_, i) => ({
        ...mockCreatePaymentDto,
        reference: `${mockCreatePaymentDto.reference}-${i}`,
        amountInCents: mockCreatePaymentDto.amountInCents + i * 1000,
      }));

      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const results = await Promise.all(
        multipleRequests.map((request) => controller.processPayment(request)),
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach((result) =>
        expect(result).toEqual(mockPaymentResponseDto),
      );
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledTimes(5);
    });

    it('should handle edge cases correctly', async () => {
      // Arrange
      const edgeCaseDto = {
        ...mockCreatePaymentDto,
        amountInCents: 0,
        currency: '',
        reference: '',
        customerEmail: '',
        customerData: {
          fullName: '',
          legalId: '',
          legalIdType: '',
        } as CustomerDataDto,
        paymentMethod: {
          type: '',
          token: '',
          installments: 0,
        } as PaymentMethodDto,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(edgeCaseDto);

      // Assert
      expect(result).toEqual(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        edgeCaseDto,
      );
    });

    it('should handle very large data correctly', async () => {
      // Arrange
      const largeDataDto = {
        ...mockCreatePaymentDto,
        amountInCents: 999999999,
        currency: 'A'.repeat(1000),
        reference: 'A'.repeat(1000),
        customerEmail: 'A'.repeat(1000) + '@' + 'A'.repeat(1000) + '.com',
        customerData: {
          fullName: 'A'.repeat(1000),
          legalId: 'A'.repeat(1000),
          legalIdType: 'A'.repeat(1000),
        } as CustomerDataDto,
        paymentMethod: {
          type: 'A'.repeat(1000),
          token: 'A'.repeat(1000),
          installments: 999999999,
        } as PaymentMethodDto,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue(
        mockPaymentResponseDto,
      );

      // Act
      const result = await controller.processPayment(largeDataDto);

      // Assert
      expect(result).toEqual(mockPaymentResponseDto);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        largeDataDto,
      );
    });
  });
});
