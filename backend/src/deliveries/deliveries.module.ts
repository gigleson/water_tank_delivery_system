import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';

import {
    Delivery,
    DeliverySchema,
} from './model/delivery.model';

import { OrdersModule } from '../orders/orders.module';
import { Users, UsersSchema } from '../users/model/users.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Delivery.name, schema: DeliverySchema },
            { name: Users.name, schema: UsersSchema },
        ]),
        OrdersModule,
    ],
    controllers: [DeliveriesController],
    providers: [DeliveriesService],
    exports: [DeliveriesService],
})
export class DeliveriesModule {}