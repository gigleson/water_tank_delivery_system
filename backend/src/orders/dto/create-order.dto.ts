import {
    IsEnum,
    IsOptional,
    IsNumber,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../model/order.model';

export class CreateOrderDto {
    @ApiProperty({
        example: 1500,
        description: 'Total amount of the order',
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    totalAmount: number;

    @ApiProperty({
        enum: PaymentMethod,
        example: PaymentMethod.CASH,
    })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiPropertyOptional({
        example: 'Deliver  water in the morning',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}