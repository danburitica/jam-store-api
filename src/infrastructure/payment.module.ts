import { Module } from '@nestjs/common';
import { ProcessPaymentUseCase } from '../application/use-cases/process-payment.use-case';
import { GetAcceptanceTokenUseCase } from '../application/use-cases/get-acceptance-token.use-case';
import { CreateCardTokenUseCase } from '../application/use-cases/create-card-token.use-case';
import { CreatePaymentTransactionUseCase } from '../application/use-cases/create-payment-transaction.use-case';
import { GetTransactionStatusUseCase } from '../application/use-cases/get-transaction-status.use-case';
import { PaymentController } from './controllers/payment.controller';
import { PaymentRepository } from './persistence/repositories/payment.repository';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PAYMENT_REPOSITORY } from '../domain/repositories/payment.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../domain/services/payment-gateway.service.interface';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [
    // Casos de uso
    ProcessPaymentUseCase,
    GetAcceptanceTokenUseCase,
    CreateCardTokenUseCase,
    CreatePaymentTransactionUseCase,
    GetTransactionStatusUseCase,

    // Servicios
    PaymentGatewayService,

    // Repositorios
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: PAYMENT_GATEWAY_SERVICE,
      useClass: PaymentGatewayService,
    },
  ],
})
export class PaymentModule {}
