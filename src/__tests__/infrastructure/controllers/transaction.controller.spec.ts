import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../../infrastructure/controllers/transaction.controller';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { CreateTransactionDto } from '../../../application/dto/create-transaction.dto';
import { TransactionResponseDto } from '../../../application/dto/transaction-response.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let mockCreateTransactionUseCase: jest.Mocked<CreateTransactionUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    mockCreateTransactionUseCase = module.get(CreateTransactionUseCase);
  });

  describe('createTransaction', () => {
    it('should create transaction successfully and return TransactionResponseDto', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const mockTransactionResponseDto: TransactionResponseDto = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 10000,
        currency: 'COP',
      };

      mockCreateTransactionUseCase.execute.mockResolvedValue(
        mockTransactionResponseDto,
      );

      // Act
      const result = await controller.createTransaction(
        mockCreateTransactionDto,
      );

      // Assert
      expect(result).toBe(mockTransactionResponseDto);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        mockCreateTransactionDto,
      );
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle different amounts correctly', async () => {
      // Arrange
      const differentAmountDto = {
        ...mockCreateTransactionDto,
        amountInCents: 5000,
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 5000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(differentAmountDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        differentAmountDto,
      );
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdDto = {
        ...mockCreateTransactionDto,
        currency: 'USD',
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 10000,
        currency: 'USD',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(usdDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(usdDto);
    });

    it('should handle different customer data correctly', async () => {
      // Arrange
      const differentCustomerDto = {
        ...mockCreateTransactionDto,
        customerData: {
          fullName: 'María García',
          legalId: '87654321',
          legalIdType: 'CE',
        },
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 10000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(differentCustomerDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        differentCustomerDto,
      );
    });

    it('should handle different payment methods correctly', async () => {
      // Arrange
      const differentPaymentMethodDto = {
        ...mockCreateTransactionDto,
        paymentMethod: {
          type: 'debit',
          token: 'tok_debit_123',
          installments: 3,
        },
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 10000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(
        differentPaymentMethodDto,
      );

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        differentPaymentMethodDto,
      );
    });

    it('should propagate errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const mockError = new Error('Failed to create transaction');
      mockCreateTransactionUseCase.execute.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(mockError);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        mockCreateTransactionDto,
      );
    });

    it('should handle validation errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const validationError = new Error('Invalid transaction data');
      mockCreateTransactionUseCase.execute.mockRejectedValue(validationError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(validationError);
    });

    it('should handle network errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const networkError = new Error('Network timeout');
      mockCreateTransactionUseCase.execute.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(networkError);
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount correctly', async () => {
      // Arrange
      const zeroAmountDto = {
        ...mockCreateTransactionDto,
        amountInCents: 0,
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 0,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(zeroAmountDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        zeroAmountDto,
      );
    });

    it('should handle large amounts correctly', async () => {
      // Arrange
      const largeAmountDto = {
        ...mockCreateTransactionDto,
        amountInCents: 999999999,
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 999999999,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(largeAmountDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        largeAmountDto,
      );
    });

    it('should handle negative amounts correctly', async () => {
      // Arrange
      const negativeAmountDto = {
        ...mockCreateTransactionDto,
        amountInCents: -1000,
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: -1000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(negativeAmountDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        negativeAmountDto,
      );
    });

    it('should handle empty reference correctly', async () => {
      // Arrange
      const emptyReferenceDto = {
        ...mockCreateTransactionDto,
        reference: '',
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: '',
        amount: 10000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(emptyReferenceDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        emptyReferenceDto,
      );
    });

    it('should handle empty customer email correctly', async () => {
      // Arrange
      const emptyEmailDto = {
        ...mockCreateTransactionDto,
        customerEmail: '',
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_123456',
        status: 'PENDING',
        reference: 'REF-123456',
        amount: 10000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(emptyEmailDto);

      // Assert
      expect(result).toBe(mockResponse);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        emptyEmailDto,
      );
    });
  });

  describe('real-world scenarios', () => {
    it('should handle Colombian peso transactions', async () => {
      // Arrange
      const copDto = {
        ...mockCreateTransactionDto,
        currency: 'COP',
        amountInCents: 50000, // 500 pesos
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_cop_123',
        status: 'PENDING',
        reference: 'REF-COP-123',
        amount: 50000,
        currency: 'COP',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(copDto);

      // Assert
      expect(result.currency).toBe('COP');
      expect(result.amount).toBe(50000);
    });

    it('should handle US dollar transactions', async () => {
      // Arrange
      const usdDto = {
        ...mockCreateTransactionDto,
        currency: 'USD',
        amountInCents: 1999, // $19.99
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_usd_123',
        status: 'PENDING',
        reference: 'REF-USD-123',
        amount: 1999,
        currency: 'USD',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(usdDto);

      // Assert
      expect(result.currency).toBe('USD');
      expect(result.amount).toBe(1999);
    });

    it('should handle Euro transactions', async () => {
      // Arrange
      const eurDto = {
        ...mockCreateTransactionDto,
        currency: 'EUR',
        amountInCents: 2500, // €25.00
      } as CreateTransactionDto;

      const mockResponse = {
        transactionId: 'txn_eur_123',
        status: 'PENDING',
        reference: 'REF-EUR-123',
        amount: 2500,
        currency: 'EUR',
      } as TransactionResponseDto;

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createTransaction(eurDto);

      // Assert
      expect(result.currency).toBe('EUR');
      expect(result.amount).toBe(2500);
    });
  });

  describe('multiple transactions', () => {
    it('should handle multiple consecutive transactions correctly', async () => {
      // Arrange
      const transactions = Array.from({ length: 5 }, (_, i) => ({
        ...mockCreateTransactionDto,
        reference: `REF-${i}`,
        amountInCents: 1000 + i * 1000,
      })) as CreateTransactionDto[];

      const mockResponses = transactions.map((_, i) => ({
        transactionId: `txn_${i}`,
        status: 'PENDING',
        reference: `REF-${i}`,
        amount: 1000 + i * 1000,
        currency: 'COP',
      })) as TransactionResponseDto[];

      transactions.forEach((_, i) => {
        mockCreateTransactionUseCase.execute.mockResolvedValueOnce(
          mockResponses[i],
        );
      });

      // Act
      const results = await Promise.all(
        transactions.map((transaction) =>
          controller.createTransaction(transaction),
        ),
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.transactionId).toBe(`txn_${index}`);
        expect(result.reference).toBe(`REF-${index}`);
        expect(result.amount).toBe(1000 + index * 1000);
      });
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledTimes(5);
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const authError = new Error('Invalid API key');
      mockCreateTransactionUseCase.execute.mockRejectedValue(authError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(authError);
    });

    it('should handle rate limit errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const rateLimitError = new Error('Rate limit exceeded');
      mockCreateTransactionUseCase.execute.mockRejectedValue(rateLimitError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(rateLimitError);
    });

    it('should handle server errors from use case', async () => {
      // Arrange
      const mockCreateTransactionDto: CreateTransactionDto = {
        amountInCents: 10000,
        currency: 'COP',
        reference: 'REF-123456',
        customerEmail: 'test@example.com',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
        paymentMethod: {
          type: 'card',
          token: 'tok_test_123',
          installments: 1,
        },
        acceptanceToken: 'acceptance_token_123',
        signature: 'signature_123',
      };

      const serverError = new Error('Internal server error');
      mockCreateTransactionUseCase.execute.mockRejectedValue(serverError);

      // Act & Assert
      await expect(
        controller.createTransaction(mockCreateTransactionDto),
      ).rejects.toThrow(serverError);
    });
  });
});

// Mock DTOs for testing
const mockCreateTransactionDto: CreateTransactionDto = {
  amountInCents: 10000,
  currency: 'COP',
  reference: 'REF-123456',
  customerEmail: 'test@example.com',
  customerData: {
    fullName: 'Juan Pérez',
    legalId: '12345678',
    legalIdType: 'CC',
  },
  paymentMethod: {
    type: 'card',
    token: 'tok_test_123',
    installments: 1,
  },
  acceptanceToken: 'acceptance_token_123',
  signature: 'signature_123',
};
