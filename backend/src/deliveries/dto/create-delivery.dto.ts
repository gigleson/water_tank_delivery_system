import {
    IsMongoId,
    IsOptional,
    IsDateString,
    IsString,
    MaxLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateDeliveryDto {

    @ApiProperty({
        description: 'MongoDB ID of the order',
        example: '6926a1b2c3d4e5f678901234',
    })
    @IsMongoId()
    orderId: string;

    @ApiPropertyOptional({
        description: 'MongoDB ID of the assigned driver',
        example: '6926a1b2c3d4e5f678901235',
    })
    @IsOptional()
    @IsMongoId()
    driverId?: string;

    @ApiPropertyOptional({
        description: 'Estimated delivery date and time',
        example: '2026-11-27T10:30:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    estimatedDeliveryTime?: string;

    @ApiPropertyOptional({
        description: 'Additional delivery notes',
        example: 'Please call before arriving',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}