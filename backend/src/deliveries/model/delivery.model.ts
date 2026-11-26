import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

export enum DeliveryStatus {
    ASSIGNED = 'ASSIGNED',
    ACCEPTED = 'ACCEPTED',
    ON_THE_WAY = 'ON_THE_WAY',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Delivery {

    @Prop({
        type: Types.ObjectId,
        ref: 'Order',
        required: true,
    })
    orderId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
    })
    driverId?: Types.ObjectId;

    @Prop({
        type: String,
        enum: DeliveryStatus,
        default: DeliveryStatus.ASSIGNED,
    })
    deliveryStatus: DeliveryStatus;

    @Prop()
    estimatedDeliveryTime?: Date;

    @Prop()
    startedAt?: Date;

    @Prop()
    completedAt?: Date;

    @Prop()
    notes?: string;

    @Prop()
    paymentPhoto?: string;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);