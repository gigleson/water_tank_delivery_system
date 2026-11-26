import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { Delivery, DeliveryDocument, DeliveryStatus } from './model/delivery.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { Users } from '../users/model/users.model';
@Injectable()
export class DeliveriesService {
  
        constructor(
        @InjectModel(Delivery.name)
        private readonly deliveryModel: Model<DeliveryDocument>,

        @InjectModel(Users.name)
        private readonly userModel: Model<Users>,

        private readonly ordersService: OrdersService,
    ) {}

    // CREATE DELIVERY
    async createDelivery(dto: CreateDeliveryDto) {
        // Check whether the order exists
        const orderResponse = await this.ordersService.getOrderById(
            dto.orderId,
        );

        const order = orderResponse.data;

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check whether the driver exists
        if (dto.driverId) {
            const driver = await this.userModel.findById(dto.driverId);

            if (!driver) {
                throw new NotFoundException('Driver not found');
            }

            // Ensure the selected user has the DRIVER role
            if (driver.role !== 'DRIVER') {
                throw new BadRequestException(
                    'Selected user is not a driver',
                );
            }
        }

        // Create delivery
        const delivery = await this.deliveryModel.create({
            orderId: new Types.ObjectId(order._id),
            driverId: dto.driverId
                ? new Types.ObjectId(dto.driverId)
                : undefined,
            deliveryStatus: DeliveryStatus.ASSIGNED,
            estimatedDeliveryTime: dto.estimatedDeliveryTime
                ? new Date(dto.estimatedDeliveryTime)
                : undefined,
            notes: dto.notes,
        });

        return {
            success: true,
            message: 'Delivery created successfully',
            data: delivery,
        };
    }
    // GET ALL DELIVERIES
async getDeliveries() {
    const deliveries = await this.deliveryModel
        .find()
        .populate('orderId')
        .populate('driverId')
        .sort({ createdAt: -1 });

    return {
        success: true,
        data: deliveries,
    };
}

// GET DELIVERY BY ID
async getDeliveryById(id: string) {
    const delivery = await this.deliveryModel
        .findById(id)
        .populate('orderId')
        .populate('driverId');

    if (!delivery) {
        throw new NotFoundException('Delivery not found');
    }

    return {
        success: true,
        data: delivery,
    };
}
async uploadPaymentPhoto(
    deliveryId: string,
    file: Express.Multer.File,
) {
    const delivery = await this.deliveryModel.findById(deliveryId);

    if (!delivery) {
        throw new NotFoundException('Delivery not found');
    }

    if (!file) {
        throw new BadRequestException('Payment photo is required');
    }

    const uploadDirectory = join(
        process.cwd(),
        'uploads',
        'payment-photos',
    );

    await mkdir(uploadDirectory, { recursive: true });

    const filename = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;

    const filePath = join(uploadDirectory, filename);

    await writeFile(filePath, file.buffer);

    delivery.paymentPhoto = `uploads/payment-photos/${filename}`;

    await delivery.save();

    return {
        success: true,
        message: 'Payment photo uploaded successfully',
        paymentPhoto: delivery.paymentPhoto,
    };
}

}
