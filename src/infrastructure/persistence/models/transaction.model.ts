export class TransactionModel {
  constructor(
    public readonly id: string,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}
}
