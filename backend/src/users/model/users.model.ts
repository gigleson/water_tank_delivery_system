
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsersDocument = Users & Document;

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    SUPPLIER = 'SUPPLIER',
    DRIVER = 'DRIVER',
    ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class Users {

    @Prop({ required: true })
    fullname: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop()
    phone: string;

    @Prop({ required: true, select: true })
    password: string;

    @Prop({
        type: String,
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;
}


export const UsersSchema = SchemaFactory.createForClass(Users);
