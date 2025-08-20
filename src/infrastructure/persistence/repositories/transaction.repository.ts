import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { TransactionModel } from '../models/transaction.model';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  // Por ahora usamos un array en memoria, más adelante se conectará a una base de datos
  private transactions: TransactionModel[] = [];

  async save(transaction: Transaction): Promise<Transaction> {
    // Convertir la entidad del dominio al modelo de persistencia
    const transactionModel = new TransactionModel(
      transaction.id,
      transaction.status,
      transaction.createdAt,
    );

    // Guardar en memoria
    this.transactions.push(transactionModel);

    // Retornar la entidad del dominio
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const transactionModel = this.transactions.find((t) => t.id === id);

    if (!transactionModel) {
      return null;
    }

    // Convertir el modelo de persistencia a la entidad del dominio
    return new Transaction(
      transactionModel.id,
      transactionModel.status as any, // Cast temporal
      transactionModel.createdAt,
    );
  }
}
