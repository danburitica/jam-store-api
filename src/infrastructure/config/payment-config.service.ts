import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Obtiene la API key pública de la pasarela de pagos
   */
  get publicKey(): string {
    return this.configService.get<string>('PAYMENT_PUBLIC_KEY') || '';
  }

  /**
   * Obtiene el secret de integridad para validar respuestas
   */
  get integritySecret(): string {
    return this.configService.get<string>('PAYMENT_INTEGRITY_SECRET') || '';
  }

  /**
   * Obtiene la URL base de la API de la pasarela
   */
  get apiUrl(): string {
    return this.configService.get<string>('PAYMENT_API_URL') || '';
  }

  /**
   * Obtiene el timeout para las llamadas a la API
   */
  get timeout(): number {
    return this.configService.get<number>('PAYMENT_TIMEOUT') || 30000;
  }

  /**
   * Valida que todas las variables de entorno requeridas estén configuradas
   */
  validateConfig(): void {
    const requiredVars = [
      'PAYMENT_PUBLIC_KEY',
      'PAYMENT_INTEGRITY_SECRET',
      'PAYMENT_API_URL',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Variables de entorno requeridas no configuradas: ${missingVars.join(', ')}`,
      );
    }
  }
}
