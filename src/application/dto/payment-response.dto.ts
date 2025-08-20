export class PaymentResponseDto {
  constructor(
    public readonly paymentId: string,
    public readonly status: string,
    public readonly reference: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {}
}
