
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    Order,
    OrderDocument,
} from './model/order.model';

import { CreateOrderDto } from './dto/create-order.dto';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>,
        private readonly redisService: RedisService,
    ) {}

    async createOrder(
        customerId: string,
        createOrderDto: CreateOrderDto,
    ) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException('Invalid customer ID');
        }

        const orderNumber = `ORD-${Date.now()}`;

        const order = await this.orderModel.create({
            ...createOrderDto,
            orderNumber,
            customerId: new Types.ObjectId(customerId),
        });
        await this.redisService.delete('orders:all');

        return {
            success: true,
            message: 'Order created successfully',
            data: order,
        };
    }

   async getOrders() {
  // Check Redis cache first
  const cachedOrders = await this.redisService.get('orders:all');

  if (cachedOrders) {
    return cachedOrders;
  }

  // Fetch from MongoDB if cache is empty
  const orders = await this.orderModel
    .find()
    .sort({ createdAt: -1 });

  const response = {
    success: true,
    data: orders,
  };

  // Store result in Redis for 60 seconds
  await this.redisService.set('orders:all', response, 60);

  return response;
}

    async getOrderById(id: string) {
    const order = await this.orderModel.findOne({
        $or: [
            {
                _id: Types.ObjectId.isValid(id)
                    ? new Types.ObjectId(id)
                    : null,
            },
            { orderNumber: id },
        ],
    });

    if (!order) {
        throw new NotFoundException('Order not found');
    }

    return {
        success: true,
        data: order,
    };
}
}
