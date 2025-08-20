import {
  CardTokenRequest,
  PaymentTransactionRequest,
} from '../entities/payment.entity';

export const PAYMENT_GATEWAY_SERVICE = 'PAYMENT_GATEWAY_SERVICE';

export interface IPaymentGatewayService {
  getAcceptanceToken(): Promise<string>;
  createCardToken(cardData: CardTokenRequest): Promise<string>;
  generateSignature(
    reference: string,
    amount: number,
    currency: string,
  ): Promise<string>;
  createTransaction(
    transactionData: PaymentTransactionRequest,
  ): Promise<{ id: string; status: string }>;
  getTransactionStatus(transactionId: string): Promise<string>;
}
