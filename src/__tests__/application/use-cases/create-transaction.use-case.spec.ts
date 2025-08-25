import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '../../../application/use-cases/create-transaction.use-case';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import { CreateTransactionDto } from '../../../application/dto/create-transaction.dto';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

// Mock utilities
jest.mock('../../../shared/utils/signature.util');
jest.mock('../../../shared/utils/reference.util');

import { generateTransactionSignature } from '../../../shared/utils/signature.util';
import { generateTransactionReference } from '../../../shared/utils/reference.util';

const mockGenerateTransactionSignature =
  generateTransactionSignature as jest.MockedFunction<
    typeof generateTransactionSignature
  >;
const mockGenerateTransactionReference =
  generateTransactionReference as jest.MockedFunction<
    typeof generateTransactionReference
  >;

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;
  let mockCreateTransactionDto: CreateTransactionDto;

  beforeEach(async () => {
    const mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockGateway = {
      getAcceptanceToken: jest.fn(),
      createCardToken: jest.fn(),
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepo,
        },
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockGateway,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    mockTransactionRepository = module.get(TRANSACTION_REPOSITORY);
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);

    // Setup default mocks
    mockGenerateTransactionReference.mockReturnValue('REF-123456');
    mockGenerateTransactionSignature.mockResolvedValue('signature_123');

    // Setup default DTO
    mockCreateTransactionDto = {
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '2025',
      cardHolderName: 'Juan Pérez',
      amountInCents: 10000,
      customerEmail: 'test@example.com',
      documentNumber: '12345678',
      documentType: 'CC',
      installments: 1,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create transaction successfully with complete flow', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };
      const mockFinalStatus = 'APPROVED';

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockFinalStatus,
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(mockCreateTransactionDto);

      // Assert
      expect(result).toEqual({
        transactionId: mockTransaction.id,
        status: mockFinalStatus,
        externalTransactionId: mockExternalTransaction.id,
        reference: 'REF-123456',
        amount: 10000,
        currency: 'COP',
        message: 'Transacción procesada exitosamente',
        attempts: 1,
      });

      expect(mockTransactionRepository.save).toHaveBeenCalledWith(
        expect.any(Transaction),
      );
      expect(mockPaymentGatewayService.getAcceptanceToken).toHaveBeenCalled();
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith({
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Juan Pérez',
      });
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith({
        acceptanceToken: mockAcceptanceToken,
        amountInCents: 10000,
        currency: 'COP',
        signature: 'signature_123',
        customerEmail: 'test@example.com',
        paymentMethod: {
          type: 'CARD',
          token: mockCardToken,
          installments: 1,
        },
        reference: 'REF-123456',
        customerData: {
          fullName: 'Juan Pérez',
          legalId: '12345678',
          legalIdType: 'CC',
        },
      });
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockExternalTransaction.id);
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        mockFinalStatus,
      );
    });

    it('should handle timeout when status remains PENDING', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'PENDING',
      ); // Always PENDING
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(mockCreateTransactionDto);

      // Assert
      expect(result.status).toBe('TIMEOUT');
      expect(result.message).toBe(
        'Transacción procesada pero el status final no se pudo determinar',
      );
      expect(result.attempts).toBe(10); // Max attempts reached
    }, 10000); // Increase timeout to 10 seconds

    it('should handle different final statuses correctly', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const statuses = ['APPROVED', 'DECLINED', 'ERROR', 'CANCELLED'];

      for (const status of statuses) {
        mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
          status,
        );

        // Act
        const result = await useCase.execute(mockCreateTransactionDto);

        // Assert
        expect(result.status).toBe(status);
        expect(result.message).toBe('Transacción procesada exitosamente');
      }
    });

    it('should handle errors in payment gateway flow and mark as FAILED', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockError = new Error('Payment gateway error');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(mockError);
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Payment gateway error',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });

    it('should handle errors in transaction creation and mark as FAILED', async () => {
      // Arrange
      const mockError = new Error('Repository error');
      mockTransactionRepository.save.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Repository error',
      );
    });

    it('should handle different amounts correctly', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const amounts = [0, 100, 1000, 10000, 999999];

      for (const amount of amounts) {
        const dto = { ...mockCreateTransactionDto, amountInCents: amount };

        // Act
        const result = await useCase.execute(dto);

        // Assert
        expect(result.amount).toBe(amount);
      }
    });

    it('should handle different installments correctly', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const installments = [1, 3, 6, 12, 24];

      for (const installment of installments) {
        const dto = { ...mockCreateTransactionDto, installments: installment };

        // Act
        const result = await useCase.execute(dto);

        // Assert
        expect(result).toBeDefined();
        expect(
          mockPaymentGatewayService.createTransaction,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: expect.objectContaining({
              installments: installment,
            }),
          }),
        );
      }
    });

    it('should handle different document types correctly', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const documentTypes = ['CC', 'CE', 'PP', 'NIT'];

      for (const documentType of documentTypes) {
        const dto = { ...mockCreateTransactionDto, documentType };

        // Act
        const result = await useCase.execute(dto);

        // Assert
        expect(result).toBeDefined();
        expect(
          mockPaymentGatewayService.createTransaction,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            customerData: expect.objectContaining({
              legalIdType: documentType,
            }),
          }),
        );
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty card number', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const dto = { ...mockCreateTransactionDto, cardNumber: '' };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        expect.objectContaining({
          number: '',
        }),
      );
    });

    it('should handle very long card holder name', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const longName = 'A'.repeat(1000);
      const dto = { ...mockCreateTransactionDto, cardHolderName: longName };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        expect.objectContaining({
          cardHolder: longName,
        }),
      );
    });

    it('should handle special characters in customer data', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        'APPROVED',
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      const specialName = "José-Miguel O'Connor-Smith";
      const dto = { ...mockCreateTransactionDto, cardHolderName: specialName };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPaymentGatewayService.createCardToken).toHaveBeenCalledWith(
        expect.objectContaining({
          cardHolder: specialName,
        }),
      );
    });
  });

  describe('error scenarios', () => {
    it('should handle acceptance token failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockError = new Error('Failed to get acceptance token');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(mockError);
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Failed to get acceptance token',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });

    it('should handle card token creation failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockError = new Error('Failed to create card token');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockRejectedValue(mockError);
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Failed to create card token',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });

    it('should handle external transaction creation failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockError = new Error('Failed to create external transaction');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockRejectedValue(mockError);
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Failed to create external transaction',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });

    it('should handle transaction status polling failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };
      const mockError = new Error('Failed to get transaction status');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        mockError,
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Failed to get transaction status',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete successful flow with multiple status checks', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockExternalTransaction = { id: 'ext_txn_123' };

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue(
        mockExternalTransaction,
      );

      // Simulate status progression: PENDING -> PENDING -> APPROVED
      mockPaymentGatewayService.getTransactionStatus
        .mockResolvedValueOnce('PENDING')
        .mockResolvedValueOnce('PENDING')
        .mockResolvedValueOnce('APPROVED');

      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(mockCreateTransactionDto);

      // Assert
      expect(result.status).toBe('APPROVED');
      expect(result.attempts).toBe(3);
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledTimes(3);
    });

    it('should handle signature generation failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockAcceptanceToken = 'acceptance_token_123';
      const mockCardToken = 'card_token_123';
      const mockError = new Error('Failed to generate signature');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.createCardToken.mockResolvedValue(
        mockCardToken,
      );
      mockGenerateTransactionSignature.mockRejectedValue(mockError);
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Error en el flujo de pagos: Error: Failed to generate signature',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        mockTransaction.id,
        'FAILED',
      );
    });

    it('should handle reference generation failure', async () => {
      // Arrange
      const mockTransaction = new Transaction('txn_123', 'PENDING', new Date());
      const mockError = new Error('Failed to generate reference');

      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockGenerateTransactionReference.mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(useCase.execute(mockCreateTransactionDto)).rejects.toThrow(
        'Error creando transacción: Error: Failed to generate reference',
      );
    });
  });
});
