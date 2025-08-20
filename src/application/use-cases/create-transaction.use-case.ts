import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    // Crear la transacción usando la entidad del dominio
    const transaction = Transaction.create();

    // Guardar la transacción usando el repositorio
    const savedTransaction = await this.transactionRepository.save(transaction);

    // Retornar la respuesta usando el DTO
    return new TransactionResponseDto(
      savedTransaction.id,
      savedTransaction.status,
    );
  }
}
