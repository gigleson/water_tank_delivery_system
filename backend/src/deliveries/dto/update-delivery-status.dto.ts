import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../model/delivery.model';

export class UpdateDeliveryStatusDto {
  @ApiProperty({
    enum: DeliveryStatus,
    example: DeliveryStatus.ACCEPTED,
  })
  @IsEnum(DeliveryStatus)
  deliveryStatus: DeliveryStatus;
}