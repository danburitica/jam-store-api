import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentStatus,
} from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { PaymentModel } from '../models/payment.model';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  // Por ahora usamos un array en memoria, más adelante se conectará a una base de datos
  private payments: PaymentModel[] = [];

  save(payment: Payment): Promise<Payment> {
    // Convertir la entidad del dominio al modelo de persistencia
    const paymentModel = new PaymentModel(
      payment.id,
      payment.amount,
      payment.currency,
      payment.reference,
      payment.status,
      payment.customerEmail,
      payment.customerData,
      payment.paymentMethod,
      payment.acceptanceToken,
      payment.signature,
      payment.createdAt,
      payment.updatedAt,
    );

    // Guardar en memoria
    this.payments.push(paymentModel);

    // Retornar la entidad del dominio
    return Promise.resolve(payment);
  }

  findById(id: string): Promise<Payment | null> {
    const paymentModel = this.payments.find((p) => p.id === id);

    if (!paymentModel) {
      return Promise.resolve(null);
    }

    // Convertir el modelo de persistencia a la entidad del dominio
    return Promise.resolve(
      new Payment(
        paymentModel.id,
        paymentModel.amount,
        paymentModel.currency,
        paymentModel.reference,
        this.mapStringToPaymentStatus(paymentModel.status),
        paymentModel.customerEmail,
        paymentModel.customerData,
        paymentModel.paymentMethod,
        paymentModel.acceptanceToken,
        paymentModel.signature,
        paymentModel.createdAt,
        paymentModel.updatedAt,
      ),
    );
  }

  findByReference(reference: string): Promise<Payment | null> {
    const paymentModel = this.payments.find((p) => p.reference === reference);

    if (!paymentModel) {
      return Promise.resolve(null);
    }

    // Convertir el modelo de persistencia a la entidad del dominio
    return Promise.resolve(
      new Payment(
        paymentModel.id,
        paymentModel.amount,
        paymentModel.currency,
        paymentModel.reference,
        this.mapStringToPaymentStatus(paymentModel.status),
        paymentModel.customerEmail,
        paymentModel.customerData,
        paymentModel.paymentMethod,
        paymentModel.acceptanceToken,
        paymentModel.signature,
        paymentModel.createdAt,
        paymentModel.updatedAt,
      ),
    );
  }

  updateStatus(id: string, status: string): Promise<Payment | null> {
    const paymentModel = this.payments.find((p) => p.id === id);

    if (!paymentModel) {
      return Promise.resolve(null);
    }

    // Actualizar el status
    paymentModel.status = status;
    paymentModel.updatedAt = new Date();

    // Convertir el modelo de persistencia a la entidad del dominio
    return Promise.resolve(
      new Payment(
        paymentModel.id,
        paymentModel.amount,
        paymentModel.currency,
        paymentModel.reference,
        this.mapStringToPaymentStatus(paymentModel.status),
        paymentModel.customerEmail,
        paymentModel.customerData,
        paymentModel.paymentMethod,
        paymentModel.acceptanceToken,
        paymentModel.signature,
        paymentModel.createdAt,
        paymentModel.updatedAt,
      ),
    );
  }

  private mapStringToPaymentStatus(status: string): PaymentStatus {
    switch (status) {
      case 'PENDING':
        return PaymentStatus.PENDING;
      case 'APPROVED':
        return PaymentStatus.APPROVED;
      case 'DECLINED':
        return PaymentStatus.DECLINED;
      case 'ERROR':
        return PaymentStatus.ERROR;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
