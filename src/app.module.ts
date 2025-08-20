import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './infrastructure/transaction.module';
import { ConfigModule } from './infrastructure/config/config.module';
import { PaymentModule } from './infrastructure/payment.module';

@Module({
  imports: [ConfigModule, TransactionModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
