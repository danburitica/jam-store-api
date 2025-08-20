import { Inject, Injectable } from '@nestjs/common';
import { CardTokenRequest } from '../../domain/entities/payment.entity';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class CreateCardTokenUseCase {
  constructor(
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(cardData: CardTokenRequest): Promise<string> {
    return this.paymentGatewayService.createCardToken(cardData);
  }
}
