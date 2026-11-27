import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    StreamableFile,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { Delivery, DeliveryDocument, DeliveryStatus } from './model/delivery.model';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { Users } from '../users/model/users.model';
import { OrdersService } from '../orders/orders.service';
import { createReadStream, existsSync } from 'fs';
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
        .populate({
      path: 'driverId',
      select: '-password',
    })
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
        .populate({
      path: 'driverId',
      select: '-password',
    })

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
async updateDeliveryStatus(
  id: string,
  newStatus: DeliveryStatus,
  userId: string,
  role: string,
) {
  const delivery = await this.deliveryModel.findById(id);

  if (!delivery) {
    throw new NotFoundException('Delivery not found');
  }

  // Drivers can only update their own deliveries.
  if (role === 'DRIVER') {
  if (!delivery.driverId || delivery.driverId.toString() !== userId) {
    throw new ForbiddenException(
      'You are not assigned to this delivery',
    );
  }
} else if (role !== 'ADMIN') {
  throw new ForbiddenException(
    'You are not allowed to update delivery status',
  );
}

  // Define permitted status transitions.
  const allowedTransitions: Record<string, DeliveryStatus[]> = {
    [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED],
    [DeliveryStatus.ACCEPTED]: [
      DeliveryStatus.ON_THE_WAY,
      DeliveryStatus.FAILED,
    ],
    [DeliveryStatus.ON_THE_WAY]: [
      DeliveryStatus.DELIVERED,
      DeliveryStatus.FAILED,
    ],
  };

  const allowedStatuses = allowedTransitions[delivery.deliveryStatus] || [];

  if (!allowedStatuses.includes(newStatus)) {
    throw new BadRequestException(
      `Cannot change status from ${delivery.deliveryStatus} to ${newStatus}`,
    );
  }

  // Automatically record timestamps.
  if (newStatus === DeliveryStatus.ON_THE_WAY) {
    delivery.startedAt = new Date();
  }

  if (newStatus === DeliveryStatus.DELIVERED) {
    delivery.completedAt = new Date();
  }

  delivery.deliveryStatus = newStatus;

  await delivery.save();

  return {
    success: true,
    message: 'Delivery status updated successfully',
    data: delivery,
  };
}
async getPaymentPhoto(id: string): Promise<StreamableFile> {
  const delivery = await this.deliveryModel.findById(id);

  if (!delivery) {
    throw new NotFoundException('Delivery not found');
  }

  if (!delivery.paymentPhoto) {
    throw new NotFoundException('Payment photo not found');
  }

  const uploadDirectory = resolve(
    process.cwd(),
    'uploads/payment-photos',
  );

  const filePath = resolve(process.cwd(), delivery.paymentPhoto);

  // Prevent access to files outside the payment-photo directory.
  if (!filePath.startsWith(uploadDirectory + '/') &&
      !filePath.startsWith(uploadDirectory + '\\')) {
    throw new InternalServerErrorException('Invalid payment photo path');
  }

  if (!existsSync(filePath)) {
    throw new NotFoundException('Payment photo file not found');
  }

  const extension = extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };

  const contentType = mimeTypes[extension];

  if (!contentType) {
    throw new InternalServerErrorException('Unsupported payment photo type');
  }

  return new StreamableFile(createReadStream(filePath), {
    type: contentType,
    disposition: 'inline',
  });
}

}
