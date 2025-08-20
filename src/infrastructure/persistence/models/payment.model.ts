import {
  CustomerData,
  PaymentMethod,
} from '../../../domain/entities/payment.entity';

export class PaymentModel {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reference: string,
    public status: string,
    public readonly customerEmail: string,
    public readonly customerData: CustomerData,
    public readonly paymentMethod: PaymentMethod,
    public readonly acceptanceToken: string,
    public readonly signature: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
