import { Injectable } from '@nestjs/common';
import {
  CardTokenRequest,
  PaymentTransactionRequest,
} from '../../domain/entities/payment.entity';
import { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';
import { PaymentConfigService } from '../config/payment-config.service';
import { generateTransactionSignature } from '../../shared/utils/signature.util';

@Injectable()
export class PaymentGatewayService implements IPaymentGatewayService {
  constructor(private readonly paymentConfig: PaymentConfigService) {}

  async getAcceptanceToken(): Promise<string> {
    try {
      const url = `${this.paymentConfig.apiUrl}/merchants/${this.paymentConfig.publicKey}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error obteniendo acceptance token: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.data.presigned_acceptance.acceptance_token;
    } catch (error) {
      throw new Error(`Error en getAcceptanceToken: ${error.message}`);
    }
  }

  async createCardToken(cardData: CardTokenRequest): Promise<string> {
    try {
      const url = `${this.paymentConfig.apiUrl}/tokens/cards`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.paymentConfig.publicKey}`,
        },
        body: JSON.stringify({
          number: cardData.number,
          cvc: cardData.cvc,
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          card_holder: cardData.cardHolder,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error creando token de tarjeta: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.data.id;
    } catch (error) {
      throw new Error(`Error en createCardToken: ${error.message}`);
    }
  }

  async generateSignature(
    reference: string,
    amount: number,
    currency: string,
  ): Promise<string> {
    try {
      // Usar el helper reutilizable para generar la signature
      return await generateTransactionSignature(
        reference,
        amount,
        currency,
        this.paymentConfig.integritySecret,
      );
    } catch (error) {
      throw new Error(`Error generando signature: ${error.message}`);
    }
  }

  async createTransaction(
    transactionData: PaymentTransactionRequest,
  ): Promise<{ id: string; status: string }> {
    try {
      const url = `${this.paymentConfig.apiUrl}/transactions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.paymentConfig.publicKey}`,
        },
        body: JSON.stringify({
          acceptance_token: transactionData.acceptanceToken,
          amount_in_cents: transactionData.amountInCents,
          currency: transactionData.currency,
          signature: transactionData.signature,
          customer_email: transactionData.customerEmail,
          payment_method: {
            type: transactionData.paymentMethod.type,
            token: transactionData.paymentMethod.token,
            installments: transactionData.paymentMethod.installments,
          },
          reference: transactionData.reference,
          customer_data: {
            full_name: transactionData.customerData.fullName,
            legal_id: transactionData.customerData.legalId,
            legal_id_type: transactionData.customerData.legalIdType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error creando transacción: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        id: data.data.id,
        status: data.data.status,
      };
    } catch (error) {
      throw new Error(`Error en createTransaction: ${error.message}`);
    }
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    try {
      const url = `${this.paymentConfig.apiUrl}/transactions/${transactionId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.paymentConfig.publicKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error consultando estado de transacción: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.data.status;
    } catch (error) {
      throw new Error(`Error en getTransactionStatus: ${error.message}`);
    }
  }
}
