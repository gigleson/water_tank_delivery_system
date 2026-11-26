
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

@Schema({ timestamps: true })
export class Delivery {
    @Prop({ type: Types.ObjectId, required: true })
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    driverId: Types.ObjectId;

    @Prop({
        default: 'ASSIGNED',
        enum: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'DELIVERED', 'FAILED'],
    })
    deliveryStatus: string;

    @Prop()
    paymentPhoto: string;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
