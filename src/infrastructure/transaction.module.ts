import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from '../application/use-cases/create-transaction.use-case';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionRepository } from './persistence/repositories/transaction.repository';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { ConfigModule } from './config/config.module';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../domain/services/payment-gateway.service.interface';

@Module({
  imports: [ConfigModule],
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    PaymentGatewayService,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
    {
      provide: PAYMENT_GATEWAY_SERVICE,
      useClass: PaymentGatewayService,
    },
  ],
})
export class TransactionModule {}
