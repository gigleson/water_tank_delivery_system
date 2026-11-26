
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';

import {
    PaymentMethod,
} from '../model/order.model';

export class CreateOrderDto {
    @IsNumber()
    @Min(0)
    totalAmount: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
