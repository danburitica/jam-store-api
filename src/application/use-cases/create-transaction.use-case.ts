import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { PAYMENT_GATEWAY_SERVICE } from '../../domain/services/payment-gateway.service.interface';
import { generateTransactionSignature } from '../../shared/utils/signature.util';
import { generateTransactionReference } from '../../shared/utils/reference.util';
import type { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import type { IPaymentGatewayService } from '../../domain/services/payment-gateway.service.interface';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(PAYMENT_GATEWAY_SERVICE)
    private readonly paymentGatewayService: IPaymentGatewayService,
  ) {}

  async execute(createTransactionDto: CreateTransactionDto): Promise<any> {
    try {
      // Generar referencia única internamente
      const reference = generateTransactionReference();

      // Crear transacción inicial en estado PENDING
      const transaction = Transaction.create();
      const savedTransaction =
        await this.transactionRepository.save(transaction);

      try {
        // Paso 1: Obtener acceptance_token
        const acceptanceToken =
          await this.paymentGatewayService.getAcceptanceToken();

        // Paso 2: Crear token de tarjeta
        const cardToken = await this.paymentGatewayService.createCardToken({
          number: createTransactionDto.cardNumber,
          cvc: createTransactionDto.cvc,
          expMonth: createTransactionDto.expMonth,
          expYear: createTransactionDto.expYear,
          cardHolder: createTransactionDto.cardHolderName,
        });

        // Paso 3: Generar signature usando el helper
        const signature = await generateTransactionSignature(
          reference,
          createTransactionDto.amountInCents,
          'COP', // Currency siempre será COP
          process.env.PAYMENT_INTEGRITY_SECRET || '',
        );

        // Paso 4: Crear transacción en la pasarela externa
        const externalTransaction =
          await this.paymentGatewayService.createTransaction({
            acceptanceToken,
            amountInCents: createTransactionDto.amountInCents,
            currency: 'COP', // Currency siempre será COP
            signature,
            customerEmail: createTransactionDto.customerEmail,
            paymentMethod: {
              type: 'CARD', // Type siempre será CARD
              token: cardToken,
              installments: createTransactionDto.installments,
            },
            reference: reference,
            customerData: {
              fullName: createTransactionDto.cardHolderName,
              legalId: createTransactionDto.documentNumber,
              legalIdType: createTransactionDto.documentType,
            },
          });

        // Paso 5: Esperar hasta que el status sea diferente de PENDING
        let finalStatus = 'PENDING';
        let attempts = 0;
        const maxAttempts = 10; // Máximo 10 intentos
        const pollInterval = 1000; // Consultar cada 1 segundo

        while (finalStatus === 'PENDING' && attempts < maxAttempts) {
          // Esperar antes de la siguiente consulta
          if (attempts > 0) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }

          // Consultar estado de la transacción externa
          finalStatus = await this.paymentGatewayService.getTransactionStatus(
            externalTransaction.id,
          );

          attempts++;
        }

        // Si después de todos los intentos sigue PENDING, considerarlo como TIMEOUT
        if (finalStatus === 'PENDING') {
          finalStatus = 'TIMEOUT';
        }

        // Paso 6: Actualizar transacción en nuestro backend con el status final
        const updatedTransaction =
          await this.transactionRepository.updateStatus(
            savedTransaction.id,
            finalStatus,
          );

        // Paso 7: Responder con la transacción completa
        return {
          transactionId: updatedTransaction?.id || savedTransaction.id,
          status: finalStatus,
          externalTransactionId: externalTransaction.id,
          reference: reference,
          amount: createTransactionDto.amountInCents,
          currency: 'COP',
          message:
            finalStatus === 'TIMEOUT'
              ? 'Transacción procesada pero el status final no se pudo determinar'
              : 'Transacción procesada exitosamente',
          attempts: attempts,
        };
      } catch (error) {
        // Si falla cualquier paso, actualizar la transacción con status FAILED
        await this.transactionRepository.updateStatus(
          savedTransaction.id,
          'FAILED',
        );

        throw new Error(`Error en el flujo de pagos: ${error}`);
      }
    } catch (error) {
      throw new Error(`Error creando transacción: ${error}`);
    }
  }
}
