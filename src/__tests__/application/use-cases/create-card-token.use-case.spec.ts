import { Test, TestingModule } from '@nestjs/testing';
import { CreateCardTokenUseCase } from '../../../application/use-cases/create-card-token.use-case';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import { CardTokenRequest } from '../../../domain/entities/payment.entity';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

describe('CreateCardTokenUseCase', () => {
  let useCase: CreateCardTokenUseCase;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;

  const mockCardData: CardTokenRequest = {
    number: '4111111111111111',
    cvc: '123',
    expMonth: '12',
    expYear: '2025',
    cardHolder: 'Juan Pérez',
  };

  const mockToken = 'tok_test_123456789';

  beforeEach(async () => {
    const mockPaymentGatewayServiceImpl = {
      createCardToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCardTokenUseCase,
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockPaymentGatewayServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<CreateCardTokenUseCase>(CreateCardTokenUseCase);
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create card token successfully and return token string', async () => {
      // Arrange
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(mockCardData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        mockCardData,
      );
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle different card numbers correctly', async () => {
      // Arrange
      const differentCardData = { ...mockCardData, number: '5555555555554444' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(differentCardData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        differentCardData,
      );
    });

    it('should handle different CVC values correctly', async () => {
      // Arrange
      const differentCvcData = { ...mockCardData, cvc: '999' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(differentCvcData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        differentCvcData,
      );
    });

    it('should handle different expiration months correctly', async () => {
      // Arrange
      const differentExpMonthData = { ...mockCardData, expMonth: '01' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(differentExpMonthData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        differentExpMonthData,
      );
    });

    it('should handle different expiration years correctly', async () => {
      // Arrange
      const differentExpYearData = { ...mockCardData, expYear: '2030' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(differentExpYearData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        differentExpYearData,
      );
    });

    it('should handle different card holder names correctly', async () => {
      // Arrange
      const differentHolderData = {
        ...mockCardData,
        cardHolder: 'María García',
      };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(differentHolderData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        differentHolderData,
      );
    });

    it('should handle empty card holder name', async () => {
      // Arrange
      const emptyHolderData = { ...mockCardData, cardHolder: '' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(emptyHolderData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        emptyHolderData,
      );
    });

    it('should handle single character CVC', async () => {
      // Arrange
      const singleCvcData = { ...mockCardData, cvc: '1' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(singleCvcData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        singleCvcData,
      );
    });

    it('should handle four character CVC', async () => {
      // Arrange
      const fourCvcData = { ...mockCardData, cvc: '1234' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(fourCvcData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        fourCvcData,
      );
    });

    it('should handle single digit expiration month', async () => {
      // Arrange
      const singleMonthData = { ...mockCardData, expMonth: '1' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(singleMonthData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        singleMonthData,
      );
    });

    it('should handle single digit expiration year', async () => {
      // Arrange
      const singleYearData = { ...mockCardData, expYear: '5' };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(singleYearData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        singleYearData,
      );
    });

    it('should handle special characters in card holder name', async () => {
      // Arrange
      const specialCharData = {
        ...mockCardData,
        cardHolder: "José-Miguel O'Connor",
      };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(specialCharData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        specialCharData,
      );
    });

    it('should handle very long card holder name', async () => {
      // Arrange
      const longNameData = { ...mockCardData, cardHolder: 'A'.repeat(100) };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(longNameData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        longNameData,
      );
    });

    it('should handle edge case of minimum card data', async () => {
      // Arrange
      const minimalCardData: CardTokenRequest = {
        number: '1',
        cvc: '1',
        expMonth: '1',
        expYear: '1',
        cardHolder: 'A',
      };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(minimalCardData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        minimalCardData,
      );
    });

    it('should handle edge case of maximum card data', async () => {
      // Arrange
      const maximalCardData: CardTokenRequest = {
        number: '9'.repeat(20), // Very long card number
        cvc: '9'.repeat(10), // Very long CVC
        expMonth: '99', // Invalid but should be handled
        expYear: '9999', // Very long year
        cardHolder: 'Z'.repeat(1000), // Very long name
      };
      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(maximalCardData);

      // Assert
      expect(result).toBe(mockToken);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        maximalCardData,
      );
    });

    it('should propagate errors from payment gateway service', async () => {
      // Arrange
      const mockError = new Error('Payment gateway service error');
      mockPaymentGatewayService.createCardToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCardData)).rejects.toThrow(mockError);
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        mockCardData,
      );
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle network errors from payment gateway service', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      mockPaymentGatewayService.createCardToken.mockRejectedValue(networkError);

      // Act & Assert
      await expect(useCase.execute(mockCardData)).rejects.toThrow(networkError);
    });

    it('should handle validation errors from payment gateway service', async () => {
      // Arrange
      const validationError = new Error('Invalid card data');
      mockPaymentGatewayService.createCardToken.mockRejectedValue(
        validationError,
      );

      // Act & Assert
      await expect(useCase.execute(mockCardData)).rejects.toThrow(
        validationError,
      );
    });

    it('should handle authentication errors from payment gateway service', async () => {
      // Arrange
      const authError = new Error('Invalid API key');
      mockPaymentGatewayService.createCardToken.mockRejectedValue(authError);

      // Act & Assert
      await expect(useCase.execute(mockCardData)).rejects.toThrow(authError);
    });

    it('should handle rate limit errors from payment gateway service', async () => {
      // Arrange
      const rateLimitError = new Error('Rate limit exceeded');
      mockPaymentGatewayService.createCardToken.mockRejectedValue(
        rateLimitError,
      );

      // Act & Assert
      await expect(useCase.execute(mockCardData)).rejects.toThrow(
        rateLimitError,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world card data examples', async () => {
      // Arrange
      const realWorldCards = [
        {
          number: '4111111111111111', // Visa test card
          cvc: '123',
          expMonth: '12',
          expYear: '2025',
          cardHolder: 'John Doe',
        },
        {
          number: '5555555555554444', // Mastercard test card
          cvc: '321',
          expMonth: '01',
          expYear: '2026',
          cardHolder: 'Jane Smith',
        },
        {
          number: '378282246310005', // American Express test card
          cvc: '1234',
          expMonth: '06',
          expYear: '2027',
          cardHolder: 'Bob Johnson',
        },
      ];

      for (const cardData of realWorldCards) {
        mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

        // Act
        const result = await useCase.execute(cardData);

        // Assert
        expect(result).toBe(mockToken);
        expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
          cardData,
        );
      }
    });

    it('should handle multiple consecutive calls correctly', async () => {
      // Arrange
      const multipleCards = Array.from({ length: 5 }, (_, i) => ({
        ...mockCardData,
        number: `${mockCardData.number}${i}`,
        cardHolder: `${mockCardData.cardHolder} ${i}`,
      }));

      mockPaymentGatewayService.createCardToken.mockResolvedValue(mockToken);

      // Act
      const results = await Promise.all(
        multipleCards.map((cardData) => useCase.execute(cardData)),
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach((result) => expect(result).toBe(mockToken));
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledTimes(
        5,
      );
    });
  });
});
