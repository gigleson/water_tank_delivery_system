import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { Delivery, DeliveryDocument } from './model/delivery.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class DeliveriesService {
    constructor(
            @InjectModel(Delivery.name)
            private deliveryModel: Model<DeliveryDocument>,
        ) {}

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
