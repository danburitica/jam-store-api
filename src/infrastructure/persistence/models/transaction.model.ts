export class TransactionModel {
  constructor(
    public readonly id: string,
    public status: string, // Removed readonly to allow updates
    public readonly createdAt: Date,
    public updatedAt: Date, // Added updatedAt property
  ) {}
}
