
import { Test, TestingModule } from '@nestjs/testing';
import {
  
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  
  
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveryStatus } from './model/delivery.model';

describe('DeliveriesService - updateDeliveryStatus', () => {
  let service: DeliveriesService;

  let deliveryModel: {
    findById: jest.Mock;
  };

  let userModel: Record<string, jest.Mock>;
  let ordersService: Record<string, jest.Mock>;

  let mockDelivery: any;

  const deliveryId = '6b0811e89538b652cf4d05d1';
  const driverId = '6b0811cc9538b652cf4d05d0';

  beforeEach(async () => {
    mockDelivery = {
      _id: deliveryId,
      driverId,
      deliveryStatus: DeliveryStatus.ASSIGNED,
      startedAt: undefined,
      completedAt: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };

    deliveryModel = {
      findById: jest.fn().mockResolvedValue(mockDelivery),
    };

    userModel = {};
    ordersService = {};

    service = new DeliveriesService(
      deliveryModel as any,
      userModel as any,
      ordersService as any,
    );
  });

  it('should update delivery status successfully for admin', async () => {
    const result = await service.updateDeliveryStatus(
      deliveryId,
      DeliveryStatus.ACCEPTED,
      'admin-id',
      'ADMIN',
    );

    expect(mockDelivery.deliveryStatus).toBe(
      DeliveryStatus.ACCEPTED,
    );

    expect(mockDelivery.save).toHaveBeenCalled();

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'Delivery status updated successfully',
    );
  });

  it('should allow the assigned driver to update delivery status', async () => {
    const result = await service.updateDeliveryStatus(
      deliveryId,
      DeliveryStatus.ACCEPTED,
      driverId,
      'DRIVER',
    );

    expect(result.success).toBe(true);
    expect(mockDelivery.deliveryStatus).toBe(
      DeliveryStatus.ACCEPTED,
    );
  });

  it('should set startedAt when status changes to ON_THE_WAY', async () => {
    mockDelivery.deliveryStatus = DeliveryStatus.ACCEPTED;

    await service.updateDeliveryStatus(
      deliveryId,
      DeliveryStatus.ON_THE_WAY,
      driverId,
      'DRIVER',
    );

    expect(mockDelivery.startedAt).toBeInstanceOf(Date);
    expect(mockDelivery.save).toHaveBeenCalled();
  });

  it('should set completedAt when status changes to DELIVERED', async () => {
    mockDelivery.deliveryStatus = DeliveryStatus.ON_THE_WAY;

    await service.updateDeliveryStatus(
      deliveryId,
      DeliveryStatus.DELIVERED,
      driverId,
      'DRIVER',
    );

    expect(mockDelivery.completedAt).toBeInstanceOf(Date);
    expect(mockDelivery.save).toHaveBeenCalled();
  });

  it('should reject an invalid status transition', async () => {
    await expect(
      service.updateDeliveryStatus(
        deliveryId,
        DeliveryStatus.DELIVERED,
        driverId,
        'DRIVER',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockDelivery.save).not.toHaveBeenCalled();
  });

  it('should reject a driver who is not assigned to the delivery', async () => {
    await expect(
      service.updateDeliveryStatus(
        deliveryId,
        DeliveryStatus.ACCEPTED,
        'another-driver-id',
        'DRIVER',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject users who are neither drivers nor admins', async () => {
    await expect(
      service.updateDeliveryStatus(
        deliveryId,
        DeliveryStatus.ACCEPTED,
        'customer-id',
        'CUSTOMER',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when delivery does not exist', async () => {
    deliveryModel.findById.mockResolvedValue(null);

    await expect(
      service.updateDeliveryStatus(
        deliveryId,
        DeliveryStatus.ACCEPTED,
        'admin-id',
        'ADMIN',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
