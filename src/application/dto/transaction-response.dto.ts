export class TransactionResponseDto {
  constructor(
    public readonly transactionId: string,
    public readonly status: string,
  ) {}
}
