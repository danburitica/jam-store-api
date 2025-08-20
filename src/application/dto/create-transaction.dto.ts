import { IsEmail, IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  cvc: string;

  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @IsString()
  @IsNotEmpty()
  expYear: string;

  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsNumber()
  @Min(100) // Mínimo 1 peso (100 centavos)
  amountInCents: number;

  @IsEmail()
  customerEmail: string;

  @IsNumber()
  @Min(1)
  @Max(48) // Máximo 48 cuotas
  installments: number;
}
