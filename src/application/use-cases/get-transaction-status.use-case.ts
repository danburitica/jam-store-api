import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(transactionId: string): Promise<string> {
    return this.paymentGatewayService.getTransactionStatus(transactionId);
  }
}
