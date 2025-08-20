import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from '../application/use-cases/create-transaction.use-case';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionRepository } from './persistence/repositories/transaction.repository';
import { TRANSACTION_REPOSITORY } from '../domain/repositories/transaction.repository.interface';

@Module({
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
  ],
})
export class TransactionModule {}
