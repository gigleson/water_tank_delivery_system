import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { OrdersService } from './orders.service';
import {
    Order,
    PaymentMethod,
    PaymentStatus,
    OrderStatus,
} from './model/order.model';
import { RedisService } from '../common/redis/redis.service';
const mockRedisService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};


describe('OrdersService', () => {
    let service: OrdersService;

    const customerId = new Types.ObjectId().toString();
    const orderId = new Types.ObjectId().toString();

    const mockOrderModel = {
        create: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getModelToken(Order.name),
                    useValue: mockOrderModel,
                },
                 {
      provide: RedisService,
      useValue: mockRedisService,
    },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);

        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order successfully', async () => {
            const dto = {
                totalAmount: 1500,
                paymentMethod: PaymentMethod.CASH,
                notes: 'Test order',
            };

            const mockCreatedOrder = {
                _id: orderId,
                ...dto,
                orderNumber: 'ORD-123',
                customerId: new Types.ObjectId(customerId),
                paymentStatus: PaymentStatus.PENDING,
                orderStatus: OrderStatus.PENDING,
            };

            mockOrderModel.create.mockResolvedValue(mockCreatedOrder);

            const result = await service.createOrder(customerId, dto);

            expect(mockOrderModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalAmount: 1500,
                    paymentMethod: PaymentMethod.CASH,
                    customerId: new Types.ObjectId(customerId),
                }),
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockCreatedOrder);
        });

        it('should reject an invalid customer ID', async () => {
            await expect(
                service.createOrder('invalid-id', {
                    totalAmount: 1500,
                    paymentMethod: PaymentMethod.CASH,
                }),
            ).rejects.toThrow(BadRequestException);

            expect(mockOrderModel.create).not.toHaveBeenCalled();
        });
    });

    describe('getOrders', () => {
        it('should return all orders', async () => {
            const mockOrders = [
                { _id: orderId, totalAmount: 1500 },
            ];

            mockOrderModel.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockOrders),
            });

            const result = await service.getOrders();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockOrders);
        });
    });

    describe('getOrderById', () => {
        it('should return an order by MongoDB ID', async () => {
            const mockOrder = {
                _id: orderId,
                orderNumber: 'ORD-123',
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            const result = await service.getOrderById(orderId);

            expect(mockOrderModel.findOne).toHaveBeenCalled();
            expect(result.data).toEqual(mockOrder);
        });

        it('should return an order by order number', async () => {
            const mockOrder = {
                _id: orderId,
                orderNumber: 'ORD-123',
            };

            mockOrderModel.findOne.mockResolvedValue(mockOrder);

            const result = await service.getOrderById('ORD-123');

            expect(mockOrderModel.findOne).toHaveBeenCalled();
            expect(result.data).toEqual(mockOrder);
        });

        it('should throw NotFoundException when order is missing', async () => {
            mockOrderModel.findOne.mockResolvedValue(null);

            await expect(
                service.getOrderById('ORD-999'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});