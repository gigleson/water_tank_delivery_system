
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum PaymentMethod {
    CASH = 'CASH',
    ONLINE = 'ONLINE',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    ASSIGNED = 'ASSIGNED',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, unique: true })
    orderNumber: string;

    @Prop({ type: Types.ObjectId, required: true })
    customerId: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    totalAmount: number;

    @Prop({
        type: String,
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    paymentMethod: PaymentMethod;

    @Prop({
        type: String,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    paymentStatus: PaymentStatus;

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    orderStatus: OrderStatus;

    @Prop()
    notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
