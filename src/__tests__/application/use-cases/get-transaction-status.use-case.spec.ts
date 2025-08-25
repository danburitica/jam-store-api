import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionStatusUseCase } from '../../../application/use-cases/get-transaction-status.use-case';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

describe('GetTransactionStatusUseCase', () => {
  let useCase: GetTransactionStatusUseCase;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;

  const mockTransactionId = 'txn_123456789';
  const mockTransactionStatus = 'APPROVED';

  beforeEach(async () => {
    const mockPaymentGatewayServiceImpl = {
      getTransactionStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionStatusUseCase,
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockPaymentGatewayServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionStatusUseCase>(
      GetTransactionStatusUseCase,
    );
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should get transaction status successfully and return status string', async () => {
      // Arrange
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledTimes(1);
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
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          mockTransactionStatus,
        );

        // Act
        const result = await useCase.execute(transactionId);

        // Assert
        expect(result).toBe(mockTransactionStatus);
        expect(
          mockPaymentGatewayService.getTransactionStatus,
        ).toHaveBeenCalledWith(transactionId);
      }
    });

    it('should handle different transaction statuses correctly', async () => {
      // Arrange
      const differentStatuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
      ];

      for (const status of differentStatuses) {
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          status,
        );

        // Act
        const result = await useCase.execute(mockTransactionId);

        // Assert
        expect(result).toBe(status);
        expect(
          mockPaymentGatewayService.getTransactionStatus,
        ).toHaveBeenCalledWith(mockTransactionId);
      }
    });

    it('should handle empty transaction ID correctly', async () => {
      // Arrange
      const emptyTransactionId = '';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(emptyTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(emptyTransactionId);
    });

    it('should handle very long transaction IDs correctly', async () => {
      // Arrange
      const longTransactionId = 'txn_' + 'A'.repeat(1000);
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(longTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(longTransactionId);
    });

    it('should handle transaction IDs with special characters correctly', async () => {
      // Arrange
      const specialCharTransactionId = 'txn_@#$%^&*()_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(specialCharTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(specialCharTransactionId);
    });

    it('should handle transaction IDs with numbers correctly', async () => {
      // Arrange
      const numericTransactionId = 'txn_123456789';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(numericTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(numericTransactionId);
    });

    it('should handle transaction IDs with mixed case correctly', async () => {
      // Arrange
      const mixedCaseTransactionId = 'Txn_123_MiXeD';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(mixedCaseTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mixedCaseTransactionId);
    });

    it('should handle transaction IDs with underscores correctly', async () => {
      // Arrange
      const underscoreTransactionId = 'txn_with_many_underscores_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(underscoreTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(underscoreTransactionId);
    });

    it('should handle transaction IDs with hyphens correctly', async () => {
      // Arrange
      const hyphenTransactionId = 'txn-with-hyphens-123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(hyphenTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(hyphenTransactionId);
    });

    it('should handle transaction IDs with dots correctly', async () => {
      // Arrange
      const dotTransactionId = 'txn.with.dots.123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(dotTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(dotTransactionId);
    });

    it('should handle transaction IDs with spaces correctly', async () => {
      // Arrange
      const spaceTransactionId = 'txn with spaces 123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(spaceTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(spaceTransactionId);
    });

    it('should handle empty status correctly', async () => {
      // Arrange
      const emptyStatus = '';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        emptyStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe('');
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle very long status correctly', async () => {
      // Arrange
      const longStatus = 'A'.repeat(1000);
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        longStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(longStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with special characters correctly', async () => {
      // Arrange
      const specialCharStatus = 'STATUS_@#$%^&*()_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        specialCharStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(specialCharStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with numbers correctly', async () => {
      // Arrange
      const numericStatus = 'STATUS_123456789';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        numericStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(numericStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with mixed case correctly', async () => {
      // Arrange
      const mixedCaseStatus = 'Status_123_MiXeD';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mixedCaseStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(mixedCaseStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should propagate errors from payment gateway service', async () => {
      // Arrange
      const mockError = new Error('Payment gateway service error');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        mockError,
      );
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors from payment gateway service', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        networkError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        networkError,
      );
    });

    it('should handle authentication errors from payment gateway service', async () => {
      // Arrange
      const authError = new Error('Invalid API key');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        authError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        authError,
      );
    });

    it('should handle rate limit errors from payment gateway service', async () => {
      // Arrange
      const rateLimitError = new Error('Rate limit exceeded');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        rateLimitError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        rateLimitError,
      );
    });

    it('should handle server errors from payment gateway service', async () => {
      // Arrange
      const serverError = new Error('Internal server error');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        serverError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        serverError,
      );
    });

    it('should handle timeout errors from payment gateway service', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        timeoutError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        timeoutError,
      );
    });

    it('should handle validation errors from payment gateway service', async () => {
      // Arrange
      const validationError = new Error('Invalid transaction ID format');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        validationError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        validationError,
      );
    });

    it('should handle configuration errors from payment gateway service', async () => {
      // Arrange
      const configError = new Error('Configuration error');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        configError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        configError,
      );
    });

    it('should handle not found errors from payment gateway service', async () => {
      // Arrange
      const notFoundError = new Error('Transaction not found');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        notFoundError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        notFoundError,
      );
    });

    it('should handle permission errors from payment gateway service', async () => {
      // Arrange
      const permissionError = new Error('Insufficient permissions');
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        permissionError,
      );

      // Act & Assert
      await expect(useCase.execute(mockTransactionId)).rejects.toThrow(
        permissionError,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world transaction ID examples', async () => {
      // Arrange
      const realWorldTransactionIds = [
        'txn_visa_123456',
        'txn_mastercard_789012',
        'txn_amex_345678',
        'txn_discover_901234',
        'txn_jcb_567890',
      ];

      for (const transactionId of realWorldTransactionIds) {
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          mockTransactionStatus,
        );

        // Act
        const result = await useCase.execute(transactionId);

        // Assert
        expect(result).toBe(mockTransactionStatus);
        expect(
          mockPaymentGatewayService.getTransactionStatus,
        ).toHaveBeenCalledWith(transactionId);
      }
    });

    it('should work with real-world status examples', async () => {
      // Arrange
      const realWorldStatuses = [
        'PENDING',
        'APPROVED',
        'DECLINED',
        'ERROR',
        'CANCELLED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
        'DISPUTED',
        'SETTLED',
        'PROCESSING',
      ];

      for (const status of realWorldStatuses) {
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          status,
        );

        // Act
        const result = await useCase.execute(mockTransactionId);

        // Assert
        expect(result).toBe(status);
        expect(
          mockPaymentGatewayService.getTransactionStatus,
        ).toHaveBeenCalledWith(mockTransactionId);
      }
    });

    it('should handle multiple consecutive calls correctly', async () => {
      // Arrange
      const multipleTransactionIds = Array.from(
        { length: 10 },
        (_, i) => `txn_${i}_${Date.now()}`,
      );

      for (const transactionId of multipleTransactionIds) {
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          mockTransactionStatus,
        );

        // Act
        const result = await useCase.execute(transactionId);

        // Assert
        expect(result).toBe(mockTransactionStatus);
      }

      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledTimes(10);
    });

    it('should handle edge case of minimum transaction ID length', async () => {
      // Arrange
      const minimalTransactionId = '1';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(minimalTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(minimalTransactionId);
    });

    it('should handle edge case of maximum transaction ID length', async () => {
      // Arrange
      const maximalTransactionId = 'A'.repeat(10000);
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(maximalTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(maximalTransactionId);
    });

    it('should handle transaction IDs with only numbers', async () => {
      // Arrange
      const numericOnlyTransactionId = '12345678901234567890';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(numericOnlyTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(numericOnlyTransactionId);
    });

    it('should handle transaction IDs with only letters', async () => {
      // Arrange
      const letterOnlyTransactionId =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(letterOnlyTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(letterOnlyTransactionId);
    });

    it('should handle transaction IDs with only special characters', async () => {
      // Arrange
      const specialCharOnlyTransactionId = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(specialCharOnlyTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(specialCharOnlyTransactionId);
    });

    it('should handle transaction IDs with unicode characters', async () => {
      // Arrange
      const unicodeTransactionId = 'txn_ñáéíóú_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(unicodeTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(unicodeTransactionId);
    });

    it('should handle transaction IDs with emojis', async () => {
      // Arrange
      const emojiTransactionId = 'txn_🚀💳💰_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(emojiTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(emojiTransactionId);
    });

    it('should handle transaction IDs with newlines', async () => {
      // Arrange
      const newlineTransactionId = 'txn\nwith\nnewlines';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(newlineTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(newlineTransactionId);
    });

    it('should handle transaction IDs with tabs', async () => {
      // Arrange
      const tabTransactionId = 'txn\twith\ttabs';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );

      // Act
      const result = await useCase.execute(tabTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(tabTransactionId);
    });

    it('should handle status with unicode characters', async () => {
      // Arrange
      const unicodeStatus = 'STATUS_ñáéíóú_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        unicodeStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(unicodeStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with emojis', async () => {
      // Arrange
      const emojiStatus = 'STATUS_🚀💳💰_123';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        emojiStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(emojiStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with newlines', async () => {
      // Arrange
      const newlineStatus = 'STATUS\nwith\nnewlines';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        newlineStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(newlineStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });

    it('should handle status with tabs', async () => {
      // Arrange
      const tabStatus = 'STATUS\twith\ttabs';
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        tabStatus,
      );

      // Act
      const result = await useCase.execute(mockTransactionId);

      // Assert
      expect(result).toBe(tabStatus);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
    });
  });
});
