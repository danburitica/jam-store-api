import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './infrastructure/transaction.module';
import { ConfigModule } from './infrastructure/config/config.module';

@Module({
  imports: [ConfigModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
