import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { PaymentConfigService } from './payment-config.service';
import { ConfigTestService } from './config-test.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigModule esté disponible globalmente
      envFilePath: '.env', // Ruta del archivo .env
      cache: true, // Cachea las variables de entorno para mejor rendimiento
    }),
  ],
  providers: [PaymentConfigService, ConfigTestService],
  exports: [PaymentConfigService, ConfigTestService],
})
export class ConfigModule {}
