import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGatewayService } from '../../../infrastructure/services/payment-gateway.service';
import { PaymentConfigService } from '../../../infrastructure/config/payment-config.service';
import {
  CardTokenRequest,
  PaymentTransactionRequest,
} from '../../../domain/entities/payment.entity';
import { generateTransactionSignature } from '../../../shared/utils/signature.util';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the signature utility
jest.mock('../../../shared/utils/signature.util');
const mockGenerateTransactionSignature =
  generateTransactionSignature as jest.MockedFunction<
    typeof generateTransactionSignature
  >;

describe('PaymentGatewayService', () => {
  let service: PaymentGatewayService;
  let mockPaymentConfig: jest.Mocked<PaymentConfigService>;

  const mockConfigValues = {
    apiUrl: 'https://api.payments.test',
    publicKey: 'pk_test_123456789',
    integritySecret: 'secret_123456789',
    timeout: 30000,
  };

  const mockAcceptanceToken = 'acceptance_token_123';
  const mockCardToken = 'tok_test_123';
  const mockSignature = 'signature_123';
  const mockTransactionId = 'txn_123456';
  const mockTransactionStatus = 'APPROVED';

  beforeEach(async () => {
    const mockPaymentConfigImpl = {
      apiUrl: mockConfigValues.apiUrl,
      publicKey: mockConfigValues.publicKey,
      integritySecret: mockConfigValues.integritySecret,
      timeout: mockConfigValues.timeout,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGatewayService,
        {
          provide: PaymentConfigService,
          useValue: mockPaymentConfigImpl,
        },
      ],
    }).compile();

    service = module.get<PaymentGatewayService>(PaymentGatewayService);
    mockPaymentConfig = module.get(PaymentConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getAcceptanceToken', () => {
    it('should get acceptance token successfully', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            presigned_acceptance: {
              acceptance_token: mockAcceptanceToken,
            },
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.getAcceptanceToken();

      // Assert
      expect(result).toBe(mockAcceptanceToken);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfigValues.apiUrl}/merchants/${mockConfigValues.publicKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should handle API error response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.getAcceptanceToken()).rejects.toThrow(
        'Error obteniendo acceptance token: 400 Bad Request',
      );
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.getAcceptanceToken()).rejects.toThrow(
        'Error en getAcceptanceToken: Network error',
      );
    });

    it('should handle malformed response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            // Missing presigned_acceptance
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.getAcceptanceToken()).rejects.toThrow(
        "Error en getAcceptanceToken: Cannot read properties of undefined (reading 'acceptance_token')",
      );
    });

    it('should use correct API endpoint', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            presigned_acceptance: {
              acceptance_token: mockAcceptanceToken,
            },
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await service.getAcceptanceToken();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfigValues.apiUrl}/merchants/${mockConfigValues.publicKey}`,
        expect.any(Object),
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

    it('should create card token successfully', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockCardToken,
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.createCardToken(mockCardData);

      // Assert
      expect(result).toBe(mockCardToken);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfigValues.apiUrl}/tokens/cards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockConfigValues.publicKey}`,
          },
          body: JSON.stringify({
            number: mockCardData.number,
            cvc: mockCardData.cvc,
            exp_month: mockCardData.expMonth,
            exp_year: mockCardData.expYear,
            card_holder: mockCardData.cardHolder,
          }),
        },
      );
    });

    it('should handle API error response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.createCardToken(mockCardData)).rejects.toThrow(
        'Error creando token de tarjeta: 422 Unprocessable Entity',
      );
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Act & Assert
      await expect(service.createCardToken(mockCardData)).rejects.toThrow(
        'Error en createCardToken: Network error',
      );
    });

    it('should handle malformed response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          // Missing data property entirely
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(service.createCardToken(mockCardData)).rejects.toThrow(
        "Error en createCardToken: Cannot read properties of undefined (reading 'id')",
      );
    });

    it('should transform card data correctly', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockCardToken,
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await service.createCardToken(mockCardData);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            number: '4111111111111111',
            cvc: '123',
            exp_month: '12',
            exp_year: '2025',
            card_holder: 'Juan Pérez',
          }),
        }),
      );
    });
  });

  describe('generateSignature', () => {
    it('should generate signature using utility function', async () => {
      // Arrange
      const reference = 'REF-123';
      const amount = 10000;
      const currency = 'COP';
      mockGenerateTransactionSignature.mockResolvedValue(mockSignature);

      // Act
      const result = await service.generateSignature(
        reference,
        amount,
        currency,
      );

      // Assert
      expect(result).toBe(mockSignature);
      expect(mockGenerateTransactionSignature).toHaveBeenCalledWith(
        reference,
        amount,
        currency,
        mockConfigValues.integritySecret,
      );
    });

    it('should handle signature generation error', async () => {
      // Arrange
      const reference = 'REF-123';
      const amount = 10000;
      const currency = 'COP';
      const signatureError = new Error('Signature generation failed');
      mockGenerateTransactionSignature.mockRejectedValue(signatureError);

      // Act & Assert
      await expect(
        service.generateSignature(reference, amount, currency),
      ).rejects.toThrow(
        'Error generando signature: Signature generation failed',
      );
    });

    it('should handle different input values correctly', async () => {
      // Arrange
      const testCases = [
        { reference: 'REF-1', amount: 1000, currency: 'COP' },
        { reference: 'REF-2', amount: 5000, currency: 'USD' },
        { reference: 'REF-3', amount: 0, currency: 'EUR' },
        { reference: '', amount: 999999, currency: 'GBP' },
      ];

      for (const testCase of testCases) {
        mockGenerateTransactionSignature.mockResolvedValue(mockSignature);

        // Act
        const result = await service.generateSignature(
          testCase.reference,
          testCase.amount,
          testCase.currency,
        );

        // Assert
        expect(result).toBe(mockSignature);
        expect(mockGenerateTransactionSignature).toHaveBeenCalledWith(
          testCase.reference,
          testCase.amount,
          testCase.currency,
          mockConfigValues.integritySecret,
        );
      }
    });
  });

  describe('createTransaction', () => {
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

    it('should create transaction successfully', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockTransactionId,
            status: 'PENDING',
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.createTransaction(mockTransactionData);

      // Assert
      expect(result).toEqual({
        id: mockTransactionId,
        status: 'PENDING',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfigValues.apiUrl}/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockConfigValues.publicKey}`,
          },
          body: JSON.stringify({
            acceptance_token: mockTransactionData.acceptanceToken,
            amount_in_cents: mockTransactionData.amountInCents,
            currency: mockTransactionData.currency,
            signature: mockTransactionData.signature,
            customer_email: mockTransactionData.customerEmail,
            payment_method: {
              type: mockTransactionData.paymentMethod.type,
              token: mockTransactionData.paymentMethod.token,
              installments: mockTransactionData.paymentMethod.installments,
            },
            reference: mockTransactionData.reference,
            customer_data: {
              full_name: mockTransactionData.customerData.fullName,
              legal_id: mockTransactionData.customerData.legalId,
              legal_id_type: mockTransactionData.customerData.legalIdType,
            },
          }),
        },
      );
    });

    it('should handle API error response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        service.createTransaction(mockTransactionData),
      ).rejects.toThrow('Error creando transacción: 400 Bad Request');
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        service.createTransaction(mockTransactionData),
      ).rejects.toThrow('Error en createTransaction: Network error');
    });

    it('should handle malformed response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          // Missing data property entirely
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        service.createTransaction(mockTransactionData),
      ).rejects.toThrow(
        "Error en createTransaction: Cannot read properties of undefined (reading 'id')",
      );
    });

    it('should transform transaction data correctly', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockTransactionId,
            status: 'PENDING',
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await service.createTransaction(mockTransactionData);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            acceptance_token: 'acceptance_token_123',
            amount_in_cents: 10000,
            currency: 'COP',
            signature: 'signature_123',
            customer_email: 'test@example.com',
            payment_method: {
              type: 'card',
              token: 'tok_test_123',
              installments: 1,
            },
            reference: 'REF-123456',
            customer_data: {
              full_name: 'Juan Pérez',
              legal_id: '12345678',
              legal_id_type: 'CC',
            },
          }),
        }),
      );
    });

    it('should handle different payment method types correctly', async () => {
      // Arrange
      const differentPaymentMethodData = {
        ...mockTransactionData,
        paymentMethod: {
          type: 'debit',
          token: 'tok_debit_123',
          installments: 3,
        },
      };

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockTransactionId,
            status: 'PENDING',
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await service.createTransaction(differentPaymentMethodData);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"type":"debit"'),
        }),
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

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockTransactionId,
            status: 'PENDING',
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await service.createTransaction(differentCustomerData);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"full_name":"María García"'),
        }),
      );
    });
  });

  describe('getTransactionStatus', () => {
    const mockTransactionId = 'txn_123456';

    it('should get transaction status successfully', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            status: mockTransactionStatus,
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.getTransactionStatus(mockTransactionId);

      // Assert
      expect(result).toBe(mockTransactionStatus);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockConfigValues.apiUrl}/transactions/${mockTransactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockConfigValues.publicKey}`,
          },
        },
      );
    });

    it('should handle API error response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        service.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow(
        'Error consultando estado de transacción: 404 Not Found',
      );
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        service.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow('Error en getTransactionStatus: Network error');
    });

    it('should handle malformed response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          // Missing data property entirely
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        service.getTransactionStatus(mockTransactionId),
      ).rejects.toThrow(
        "Error en getTransactionStatus: Cannot read properties of undefined (reading 'status')",
      );
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
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue({
            data: {
              status: mockTransactionStatus,
            },
          }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await service.getTransactionStatus(transactionId);

        // Assert
        expect(result).toBe(mockTransactionStatus);
        expect(global.fetch).toHaveBeenCalledWith(
          `${mockConfigValues.apiUrl}/transactions/${transactionId}`,
          expect.any(Object),
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
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn().mockResolvedValue({
            data: {
              status,
            },
          }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        // Act
        const result = await service.getTransactionStatus(mockTransactionId);

        // Assert
        expect(result).toBe(status);
      }
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete payment flow correctly', async () => {
      // Arrange
      // Mock getAcceptanceToken
      const acceptanceTokenResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            presigned_acceptance: {
              acceptance_token: mockAcceptanceToken,
            },
          },
        }),
      };

      // Mock createCardToken
      const cardTokenResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockCardToken,
          },
        }),
      };

      // Mock createTransaction
      const transactionResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockTransactionId,
            status: 'PENDING',
          },
        }),
      };

      // Mock getTransactionStatus
      const statusResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            status: mockTransactionStatus,
          },
        }),
      };

      // Mock generateSignature
      mockGenerateTransactionSignature.mockResolvedValue(mockSignature);

      // Setup fetch mock to return different responses for different calls
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(acceptanceTokenResponse)
        .mockResolvedValueOnce(cardTokenResponse)
        .mockResolvedValueOnce(transactionResponse)
        .mockResolvedValueOnce(statusResponse);

      // Act
      const acceptanceToken = await service.getAcceptanceToken();
      const cardToken = await service.createCardToken({
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Juan Pérez',
      });
      const signature = await service.generateSignature(
        'REF-123',
        10000,
        'COP',
      );
      const transaction = await service.createTransaction({
        acceptanceToken,
        amountInCents: 10000,
        currency: 'COP',
        signature,
        customerEmail: 'test@example.com',
        paymentMethod: {
          type: 'card',
          token: cardToken,
          installments: 1,
        },
        reference: 'REF-123',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
      });
      const status = await service.getTransactionStatus(transaction.id);

      // Assert
      expect(acceptanceToken).toBe(mockAcceptanceToken);
      expect(cardToken).toBe(mockCardToken);
      expect(signature).toBe(mockSignature);
      expect(transaction).toEqual({
        id: mockTransactionId,
        status: 'PENDING',
      });
      expect(status).toBe(mockTransactionStatus);
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('should handle multiple concurrent requests correctly', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            presigned_acceptance: {
              acceptance_token: mockAcceptanceToken,
            },
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const results = await Promise.all(
        Array.from({ length: 5 }, () => service.getAcceptanceToken()),
      );

      // Assert
      expect(results).toHaveLength(5);
      results.forEach((result) => expect(result).toBe(mockAcceptanceToken));
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    it('should handle edge cases correctly', async () => {
      // Arrange
      const edgeCaseCardData: CardTokenRequest = {
        number: '1',
        cvc: '1',
        expMonth: '1',
        expYear: '1',
        cardHolder: 'A',
      };

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockCardToken,
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.createCardToken(edgeCaseCardData);

      // Assert
      expect(result).toBe(mockCardToken);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            number: '1',
            cvc: '1',
            exp_month: '1',
            exp_year: '1',
            card_holder: 'A',
          }),
        }),
      );
    });

    it('should handle very large data correctly', async () => {
      // Arrange
      const largeCardData: CardTokenRequest = {
        number: '9'.repeat(1000),
        cvc: '9'.repeat(1000),
        expMonth: '9'.repeat(1000),
        expYear: '9'.repeat(1000),
        cardHolder: 'A'.repeat(1000),
      };

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: jest.fn().mockResolvedValue({
          data: {
            id: mockCardToken,
          },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await service.createCardToken(largeCardData);

      // Assert
      expect(result).toBe(mockCardToken);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            number: '9'.repeat(1000),
            cvc: '9'.repeat(1000),
            exp_month: '9'.repeat(1000),
            exp_year: '9'.repeat(1000),
            card_holder: 'A'.repeat(1000),
          }),
        }),
      );
    });
  });
});
