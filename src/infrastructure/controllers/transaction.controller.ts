import { Body, Controller, Post } from '@nestjs/common';
import { CreateTransactionDto } from '../../application/dto/create-transaction.dto';
import { TransactionResponseDto } from '../../application/dto/transaction-response.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute(createTransactionDto);
  }
}
