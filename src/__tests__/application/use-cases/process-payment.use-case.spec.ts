import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from '../../../application/use-cases/process-payment.use-case';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { IPaymentGatewayService } from '../../../domain/services/payment-gateway.service.interface';
import {
  CreatePaymentDto,
  CustomerDataDto,
  PaymentMethodDto,
} from '../../../application/dto/create-payment.dto';
import { PaymentResponseDto } from '../../../application/dto/payment-response.dto';
import {
  Payment,
  PaymentStatus,
} from '../../../domain/entities/payment.entity';
import { PAYMENT_REPOSITORY } from '../../../domain/repositories/payment.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../../domain/services/payment-gateway.service.interface';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockPaymentRepository: jest.Mocked<IPaymentRepository>;
  let mockPaymentGatewayService: jest.Mocked<IPaymentGatewayService>;

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

  const mockAcceptanceToken = 'acceptance_token_123';
  const mockSignature = 'signature_123';
  const mockTransactionId = 'txn_123456';
  const mockTransactionStatus = 'APPROVED';
  const mockPaymentId = 'pay_123456';

  beforeEach(async () => {
    const mockPaymentRepositoryImpl = {
      save: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockPaymentGatewayServiceImpl = {
      getAcceptanceToken: jest.fn(),
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
      generateSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        {
          provide: PAYMENT_REPOSITORY,
          useValue: mockPaymentRepositoryImpl,
        },
        {
          provide: PAYMENT_GATEWAY_SERVICE,
          useValue: mockPaymentGatewayServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    mockPaymentRepository = module.get(PAYMENT_REPOSITORY);
    mockPaymentGatewayService = module.get(PAYMENT_GATEWAY_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should process payment successfully and return PaymentResponseDto', async () => {
      // Arrange
      const mockPayment = Payment.create(
        mockCreatePaymentDto.amountInCents,
        mockCreatePaymentDto.currency,
        mockCreatePaymentDto.reference,
        mockCreatePaymentDto.customerEmail,
        mockCreatePaymentDto.customerData,
        mockCreatePaymentDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(
        mockPayment.updateStatus(PaymentStatus.APPROVED),
      );

      // Act
      const result = await useCase.execute(mockCreatePaymentDto);

      // Assert
      expect(result).toBeInstanceOf(PaymentResponseDto);
      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe(mockTransactionStatus);
      expect(result.reference).toBe(mockCreatePaymentDto.reference);
      expect(result.amount).toBe(mockCreatePaymentDto.amountInCents);
      expect(result.currency).toBe(mockCreatePaymentDto.currency);

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledWith(
        mockCreatePaymentDto.reference,
        mockCreatePaymentDto.amountInCents,
        mockCreatePaymentDto.currency,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledWith({
        acceptanceToken: mockAcceptanceToken,
        amountInCents: mockCreatePaymentDto.amountInCents,
        currency: mockCreatePaymentDto.currency,
        signature: mockSignature,
        customerEmail: mockCreatePaymentDto.customerEmail,
        paymentMethod: mockCreatePaymentDto.paymentMethod,
        reference: mockCreatePaymentDto.reference,
        customerData: mockCreatePaymentDto.customerData,
      });
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledWith(mockTransactionId);
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(
        expect.any(Payment),
      );
      expect(mockPaymentRepository.updateStatus).toHaveBeenCalledWith(
        mockPayment.id,
        mockTransactionStatus,
      );
    });

    it('should handle case when updateStatus returns undefined and use saved payment ID', async () => {
      // Arrange
      const mockPayment = Payment.create(
        mockCreatePaymentDto.amountInCents,
        mockCreatePaymentDto.currency,
        mockCreatePaymentDto.reference,
        mockCreatePaymentDto.customerEmail,
        mockCreatePaymentDto.customerData,
        mockCreatePaymentDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(mockCreatePaymentDto);

      // Assert
      expect(result.paymentId).toBe(mockPayment.id);
      expect(result.status).toBe(mockTransactionStatus);
    });

    it('should throw error when getAcceptanceToken fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get acceptance token');
      mockPaymentGatewayService.getAcceptanceToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to get acceptance token',
      );

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPaymentGatewayService.generateSignature,
      ).not.toHaveBeenCalled();
      expect(
        mockPaymentGatewayService.createTransaction,
      ).not.toHaveBeenCalled();
      expect(mockPaymentRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when generateSignature fails', async () => {
      // Arrange
      const mockError = new Error('Failed to generate signature');
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to generate signature',
      );

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockPaymentGatewayService.createTransaction,
      ).not.toHaveBeenCalled();
      expect(mockPaymentRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when createTransaction fails', async () => {
      // Arrange
      const mockError = new Error('Failed to create transaction');
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to create transaction',
      );

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPaymentRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when getTransactionStatus fails', async () => {
      // Arrange
      const mockError = new Error('Failed to get transaction status');
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to get transaction status',
      );

      expect(
        mockPaymentGatewayService.getAcceptanceToken,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPaymentGatewayService.createTransaction).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockPaymentGatewayService.getTransactionStatus,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when payment repository save fails', async () => {
      // Arrange
      const mockError = new Error('Failed to save payment');
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to save payment',
      );

      expect(mockPaymentRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when payment repository updateStatus fails', async () => {
      // Arrange
      const mockPayment = Payment.create(
        mockCreatePaymentDto.amountInCents,
        mockCreatePaymentDto.currency,
        mockCreatePaymentDto.reference,
        mockCreatePaymentDto.customerEmail,
        mockCreatePaymentDto.customerData,
        mockCreatePaymentDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      const mockError = new Error('Failed to update payment status');
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockRejectedValue(mockError);

      // Act & Assert
      await expect(useCase.execute(mockCreatePaymentDto)).rejects.toThrow(
        'Error procesando pago: Error: Failed to update payment status',
      );

      expect(mockPaymentRepository.updateStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle different transaction statuses correctly', async () => {
      // Arrange
      const mockPayment = Payment.create(
        mockCreatePaymentDto.amountInCents,
        mockCreatePaymentDto.currency,
        mockCreatePaymentDto.reference,
        mockCreatePaymentDto.customerEmail,
        mockCreatePaymentDto.customerData,
        mockCreatePaymentDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      const declinedStatus = 'DECLINED';
      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        declinedStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(
        mockPayment.updateStatus(PaymentStatus.DECLINED),
      );

      // Act
      const result = await useCase.execute(mockCreatePaymentDto);

      // Assert
      expect(result.status).toBe(declinedStatus);
    });

    it('should handle zero amount correctly', async () => {
      // Arrange
      const zeroAmountDto = { ...mockCreatePaymentDto, amountInCents: 0 };
      const mockPayment = Payment.create(
        zeroAmountDto.amountInCents,
        zeroAmountDto.currency,
        zeroAmountDto.reference,
        zeroAmountDto.customerEmail,
        zeroAmountDto.customerData,
        zeroAmountDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(
        mockPayment.updateStatus(PaymentStatus.APPROVED),
      );

      // Act
      const result = await useCase.execute(zeroAmountDto);

      // Assert
      expect(result.amount).toBe(0);
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledWith(
        zeroAmountDto.reference,
        0,
        zeroAmountDto.currency,
      );
    });

    it('should handle large amounts correctly', async () => {
      // Arrange
      const largeAmountDto = {
        ...mockCreatePaymentDto,
        amountInCents: 999999999,
      };
      const mockPayment = Payment.create(
        largeAmountDto.amountInCents,
        largeAmountDto.currency,
        largeAmountDto.reference,
        largeAmountDto.customerEmail,
        largeAmountDto.customerData,
        largeAmountDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(
        mockPayment.updateStatus(PaymentStatus.APPROVED),
      );

      // Act
      const result = await useCase.execute(largeAmountDto);

      // Assert
      expect(result.amount).toBe(999999999);
    });

    it('should handle different currencies correctly', async () => {
      // Arrange
      const usdDto = { ...mockCreatePaymentDto, currency: 'USD' };
      const mockPayment = Payment.create(
        usdDto.amountInCents,
        usdDto.currency,
        usdDto.reference,
        usdDto.customerEmail,
        usdDto.customerData,
        usdDto.paymentMethod,
        mockAcceptanceToken,
        mockSignature,
      );

      mockPaymentGatewayService.getAcceptanceToken.mockResolvedValue(
        mockAcceptanceToken,
      );
      mockPaymentGatewayService.generateSignature.mockResolvedValue(
        mockSignature,
      );
      mockPaymentGatewayService.createTransaction.mockResolvedValue({
        id: mockTransactionId,
        status: 'PENDING',
      });
      mockPaymentGatewayService.getTransactionStatus.mockResolvedValue(
        mockTransactionStatus,
      );
      mockPaymentRepository.save.mockResolvedValue(mockPayment);
      mockPaymentRepository.updateStatus.mockResolvedValue(
        mockPayment.updateStatus(PaymentStatus.APPROVED),
      );

      // Act
      const result = await useCase.execute(usdDto);

      // Assert
      expect(result.currency).toBe('USD');
      expect(mockPaymentGatewayService.generateSignature).toHaveBeenCalledWith(
        usdDto.reference,
        usdDto.amountInCents,
        'USD',
      );
    });
  });
});
