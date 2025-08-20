export class Transaction {
  constructor(
    public readonly id: string,
    public readonly status: TransactionStatus,
    public readonly createdAt: Date,
  ) {}

  static create(): Transaction {
    return new Transaction(
      this.generateId(),
      TransactionStatus.PENDIENTE,
      new Date(),
    );
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

export enum TransactionStatus {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}
