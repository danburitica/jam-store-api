import { Inject, Injectable } from '@nestjs/common';
import { PaymentTransactionRequest } from '../../domain/entities/payment.entity';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class CreatePaymentTransactionUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(
    transactionData: PaymentTransactionRequest,
  ): Promise<{ id: string; status: string }> {
    return this.paymentGatewayService.createTransaction(transactionData);
  }
}
