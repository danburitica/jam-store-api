import { Inject, Injectable } from '@nestjs/common';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class GetAcceptanceTokenUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(): Promise<string> {
    return this.paymentGatewayService.getAcceptanceToken();
  }
}
