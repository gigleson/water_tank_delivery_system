import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Delivery, DeliverySchema } from './model/delivery.model';

@Module({
  imports :[
      MongooseModule.forFeature([
                  {
                      name: Delivery.name,
                      schema: DeliverySchema,
                  },
              ]),
    ],
  providers: [DeliveriesService],
  controllers: [DeliveriesController]
})
export class DeliveriesModule {}
