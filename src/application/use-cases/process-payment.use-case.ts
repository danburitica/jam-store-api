import { Inject, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { Payment } from '../../domain/entities/payment.entity';
import { PAYMENT_REPOSITORY } from '../../domain/repositories/payment.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    try {
      // Paso 1: Obtener acceptance_token
      const acceptanceToken =
        await this.paymentGatewayService.getAcceptanceToken();

      // Paso 2: Crear token de tarjeta (asumiendo que ya viene en el DTO)
      // El token de tarjeta se debe crear previamente en el frontend

      // Paso 3: Generar signature
      const signature = await this.paymentGatewayService.generateSignature(
        createPaymentDto.reference,
        createPaymentDto.amountInCents,
        createPaymentDto.currency,
      );

      // Paso 4: Crear transacción en la pasarela
      const transactionResult =
        await this.paymentGatewayService.createTransaction({
          acceptanceToken,
          amountInCents: createPaymentDto.amountInCents,
          currency: createPaymentDto.currency,
          signature,
          customerEmail: createPaymentDto.customerEmail,
          paymentMethod: createPaymentDto.paymentMethod,
          reference: createPaymentDto.reference,
          customerData: createPaymentDto.customerData,
        });

      // Paso 5: Consultar estado de transacción
      const transactionStatus =
        await this.paymentGatewayService.getTransactionStatus(
          transactionResult.id,
        );

      // Crear entidad de pago en el dominio
      const payment = Payment.create(
        createPaymentDto.amountInCents,
        createPaymentDto.currency,
        createPaymentDto.reference,
        createPaymentDto.customerEmail,
        createPaymentDto.customerData,
        createPaymentDto.paymentMethod,
        acceptanceToken,
        signature,
      );

      // Guardar en el repositorio
      const savedPayment = await this.paymentRepository.save(payment);

      // Actualizar estado con el status real de la transacción
      const updatedPayment = await this.paymentRepository.updateStatus(
        savedPayment.id,
        transactionStatus,
      );

      // Retornar respuesta
      return new PaymentResponseDto(
        updatedPayment?.id || savedPayment.id,
        transactionStatus,
        createPaymentDto.reference,
        createPaymentDto.amountInCents,
        createPaymentDto.currency,
      );
    } catch (error) {
      // En un caso real, aquí se manejarían los errores de forma más robusta
      throw new Error(`Error procesando pago: ${error}`);
    }
  }
}
