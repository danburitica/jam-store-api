import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentConfigService } from './payment-config.service';

@Injectable()
export class ConfigTestService implements OnModuleInit {
  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  onModuleInit() {
    // Validar la configuración al iniciar el módulo
    try {
      this.paymentConfigService.validateConfig();
      console.log('✅ Configuración de pagos validada correctamente');
    } catch (error) {
      console.error('❌ Error en la configuración de pagos:', error);
    }
  }

  /**
   * Método para probar el acceso a la configuración
   */
  getPaymentConfig() {
    return {
      publicKey: this.paymentConfigService.publicKey,
      integritySecret: this.paymentConfigService.integritySecret,
      apiUrl: this.paymentConfigService.apiUrl,
      timeout: this.paymentConfigService.timeout,
    };
  }
}
