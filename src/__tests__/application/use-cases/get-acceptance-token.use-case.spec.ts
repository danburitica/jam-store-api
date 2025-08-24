import { Test, TestingModule } from '@nestjs/testing';
import { GetAcceptanceTokenUseCase } from '../../../application/use-cases/get-acceptance-token.use-case';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

describe('GetAcceptanceTokenUseCase', () => {
  let useCase: GetAcceptanceTokenUseCase;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;

  const mockAcceptanceToken = 'acceptance_token_123456789';

  beforeEach(async () => {
    const mockPaymentGatewayServiceImpl = {
      getAcceptanceToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAcceptanceTokenUseCase,
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockPaymentGatewayServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<GetAcceptanceTokenUseCase>(GetAcceptanceTokenUseCase);
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should get acceptance token successfully and return token string', async () => {
      // Arrange
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(mockAcceptanceToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
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
        mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(token);

        // Act
        const result = await useCase.execute();

        // Assert
        expect(result).toBe(token);
        expect(
          mockPaymentGatewayService.getAcceptanceToken,
        ).toHaveBeenCalledWith();
      }
    });

    it('should handle empty token correctly', async () => {
      // Arrange
      const emptyToken = '';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        emptyToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe('');
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle very long tokens correctly', async () => {
      // Arrange
      const longToken = 'acceptance_token_' + 'A'.repeat(1000);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(longToken);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(longToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with special characters correctly', async () => {
      // Arrange
      const specialCharToken = 'acceptance_token_@#$%^&*()_123';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        specialCharToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(specialCharToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with numbers correctly', async () => {
      // Arrange
      const numericToken = 'acceptance_token_123456789';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        numericToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(numericToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with mixed case correctly', async () => {
      // Arrange
      const mixedCaseToken = 'Acceptance_Token_123_MiXeD';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mixedCaseToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(mixedCaseToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with underscores correctly', async () => {
      // Arrange
      const underscoreToken = 'acceptance_token_with_many_underscores';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        underscoreToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(underscoreToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with hyphens correctly', async () => {
      // Arrange
      const hyphenToken = 'acceptance-token-with-hyphens';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        hyphenToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(hyphenToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with dots correctly', async () => {
      // Arrange
      const dotToken = 'acceptance.token.with.dots';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(dotToken);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(dotToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with spaces correctly', async () => {
      // Arrange
      const spaceToken = 'acceptance token with spaces';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        spaceToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(spaceToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should propagate errors from payment gateway service', async () => {
      // Arrange
      const mockError = new Error('Payment gateway service error');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(mockError);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle network errors from payment gateway service', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        networkError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(networkError);
    });

    it('should handle authentication errors from payment gateway service', async () => {
      // Arrange
      const authError = new Error('Invalid API key');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(authError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(authError);
    });

    it('should handle rate limit errors from payment gateway service', async () => {
      // Arrange
      const rateLimitError = new Error('Rate limit exceeded');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        rateLimitError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(rateLimitError);
    });

    it('should handle server errors from payment gateway service', async () => {
      // Arrange
      const serverError = new Error('Internal server error');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        serverError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(serverError);
    });

    it('should handle timeout errors from payment gateway service', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        timeoutError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(timeoutError);
    });

    it('should handle validation errors from payment gateway service', async () => {
      // Arrange
      const validationError = new Error('Invalid request format');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        validationError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(validationError);
    });

    it('should handle configuration errors from payment gateway service', async () => {
      // Arrange
      const configError = new Error('Configuration error');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(
        configError,
      );

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(configError);
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world token examples', async () => {
      // Arrange
      const realWorldTokens = [
        'acceptance_token_visa_123456',
        'acceptance_token_mastercard_789012',
        'acceptance_token_amex_345678',
        'acceptance_token_discover_901234',
        'acceptance_token_jcb_567890',
      ];

      for (const token of realWorldTokens) {
        mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(token);

        // Act
        const result = await useCase.execute();

        // Assert
        expect(result).toBe(token);
        expect(
          mockPaymentGatewayService.getAcceptanceToken,
        ).toHaveBeenCalledWith();
      }
    });

    it('should handle multiple consecutive calls correctly', async () => {
      // Arrange
      const multipleTokens = Array.from(
        { length: 10 },
        (_, i) => `token_${i}_${Date.now()}`,
      );

      for (const token of multipleTokens) {
        mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(token);

        // Act
        const result = await useCase.execute();

        // Assert
        expect(result).toBe(token);
      }

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(10);
    });

    it('should handle edge case of minimum token length', async () => {
      // Arrange
      const minimalToken = '1';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        minimalToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe('1');
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle edge case of maximum token length', async () => {
      // Arrange
      const maximalToken = 'A'.repeat(10000);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        maximalToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(maximalToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with only numbers', async () => {
      // Arrange
      const numericOnlyToken = '12345678901234567890';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        numericOnlyToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(numericOnlyToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with only letters', async () => {
      // Arrange
      const letterOnlyToken =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        letterOnlyToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(letterOnlyToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with only special characters', async () => {
      // Arrange
      const specialCharOnlyToken = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        specialCharOnlyToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(specialCharOnlyToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with unicode characters', async () => {
      // Arrange
      const unicodeToken = 'acceptance_token_ñáéíóú_123';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        unicodeToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(unicodeToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with emojis', async () => {
      // Arrange
      const emojiToken = 'acceptance_token_🚀💳💰_123';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        emojiToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(emojiToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with newlines', async () => {
      // Arrange
      const newlineToken = 'acceptance\ntoken\nwith\nnewlines';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        newlineToken,
      );

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(newlineToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });

    it('should handle tokens with tabs', async () => {
      // Arrange
      const tabToken = 'acceptance\ttoken\twith\ttabs';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(tabToken);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toBe(tabToken);
      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledWith();
    });
  });
});
