export class Payment {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reference: string,
    public readonly status: PaymentStatus,
    public readonly customerEmail: string,
    public readonly customerData: CustomerData,
    public readonly paymentMethod: PaymentMethod,
    public readonly acceptanceToken: string,
    public readonly signature: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    amount: number,
    currency: string,
    reference: string,
    customerEmail: string,
    customerData: CustomerData,
    paymentMethod: PaymentMethod,
    acceptanceToken: string,
    signature: string,
  ): Payment {
    const now = new Date();
    return new Payment(
      this.generateId(),
      amount,
      currency,
      reference,
      PaymentStatus.PENDING,
      customerEmail,
      customerData,
      paymentMethod,
      acceptanceToken,
      signature,
      now,
      now,
    );
  }

  updateStatus(status: PaymentStatus): Payment {
    return new Payment(
      this.id,
      this.amount,
      this.currency,
      this.reference,
      status,
      this.customerEmail,
      this.customerData,
      this.paymentMethod,
      this.acceptanceToken,
      this.signature,
      this.createdAt,
      new Date(),
    );
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export interface CustomerData {
  fullName: string;
  legalId: string;
  legalIdType: string;
}

export interface PaymentMethod {
  type: string;
  token: string;
  installments: number;
}

export interface CardTokenRequest {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface PaymentTransactionRequest {
  acceptanceToken: string;
  amountInCents: number;
  currency: string;
  signature: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  reference: string;
  customerData: CustomerData;
}
