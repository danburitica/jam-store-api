import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePaymentDto } from '../../application/dto/create-payment.dto';
import { PaymentResponseDto } from '../../application/dto/payment-response.dto';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { GetAcceptanceTokenUseCase } from '../../application/use-cases/get-acceptance-token.use-case';
import { CreateCardTokenUseCase } from '../../application/use-cases/create-card-token.use-case';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/create-payment-transaction.use-case';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';
import type { CardTokenRequest } from '../../domain/entities/payment.entity';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getAcceptanceTokenUseCase: GetAcceptanceTokenUseCase,
    private readonly createCardTokenUseCase: CreateCardTokenUseCase,
    private readonly createPaymentTransactionUseCase: CreatePaymentTransactionUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  @Post('process')
  async processPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.processPaymentUseCase.execute(createPaymentDto);
  }

  @Get('acceptance-token')
  async getAcceptanceToken(): Promise<{ acceptanceToken: string }> {
    const token = await this.getAcceptanceTokenUseCase.execute();
    return { acceptanceToken: token };
  }

  @Post('card-token')
  async createCardToken(
    @Body() cardData: CardTokenRequest,
  ): Promise<{ token: string }> {
    const token = await this.createCardTokenUseCase.execute(cardData);
    return { token };
  }

  @Post('transaction')
  async createTransaction(
    @Body() transactionData: any,
  ): Promise<{ id: string; status: string }> {
    return this.createPaymentTransactionUseCase.execute(transactionData);
  }

  @Get('transaction/:id/status')
  async getTransactionStatus(
    @Param('id') id: string,
  ): Promise<{ status: string }> {
    const status = await this.getTransactionStatusUseCase.execute(id);
    return { status };
  }
}
