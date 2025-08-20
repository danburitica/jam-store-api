import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDataDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  legalId: string;

  @IsString()
  @IsNotEmpty()
  legalIdType: string;
}

export class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNumber()
  installments: number;
}

export class CreatePaymentDto {
  @IsNumber()
  amountInCents: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsEmail()
  customerEmail: string;

  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData: CustomerDataDto;

  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}
