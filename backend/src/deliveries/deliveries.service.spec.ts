
import { Test, TestingModule } from '@nestjs/testing';
import {

  BadRequestException,
  ForbiddenException,
  NotFoundException,
  StreamableFile,
  
  
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveryStatus } from './model/delivery.model';
import { join } from 'path';
import * as fs from 'fs';
import { DeliveriesController } from './deliveries.controller';
const mockRedisService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};
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
      mockRedisService as any
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
  it('should return payment photo successfully', async () => {
  const directory = join(process.cwd(), 'uploads/payment-photos');
  const filename = `test-${Date.now()}.png`;
  const filePath = join(directory, filename);
  const relativePath = `uploads/payment-photos/${filename}`;

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from('test image'));

  try {
    mockDelivery.paymentPhoto = relativePath;
    deliveryModel.findById.mockResolvedValue(mockDelivery);

    const result = await service.getPaymentPhoto(deliveryId);

    expect(result).toBeInstanceOf(StreamableFile);

    result.getStream().destroy();
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

it('should throw NotFoundException when delivery does not exist', async () => {
  deliveryModel.findById.mockResolvedValue(null);

  await expect(
    service.getPaymentPhoto(deliveryId),
  ).rejects.toThrow(NotFoundException);
});

it('should throw NotFoundException when payment photo does not exist', async () => {
  mockDelivery.paymentPhoto = undefined;
  deliveryModel.findById.mockResolvedValue(mockDelivery);

  await expect(
    service.getPaymentPhoto(deliveryId),
  ).rejects.toThrow(NotFoundException);
});

it('should throw NotFoundException when payment photo file is missing', async () => {
  mockDelivery.paymentPhoto =
    'uploads/payment-photos/non-existing-image.png';

  deliveryModel.findById.mockResolvedValue(mockDelivery);

  await expect(
    service.getPaymentPhoto(deliveryId),
  ).rejects.toThrow(NotFoundException);
});
describe('DeliveriesController - uploadPaymentPhoto', () => {
  let controller: DeliveriesController;
  let deliveriesService: {
    uploadPaymentPhoto: jest.Mock;
  };

  const deliveryId = '6b0811e89538b652cf4d05d1';

  beforeEach(async () => {
    deliveriesService = {
      uploadPaymentPhoto: jest.fn().mockResolvedValue({
        success: true,
        message: 'Payment photo uploaded successfully',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [
        {
          provide: DeliveriesService,
          useValue: deliveriesService,
        },
      ],
    }).compile();

    controller = module.get<DeliveriesController>(
      DeliveriesController,
    );
  });

  it('should upload payment photo successfully', async () => {
    const file = {
      originalname: 'payment.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('test image'),
    } as Express.Multer.File;

    const result = await controller.uploadPaymentPhoto(
      deliveryId,
      file,
    );

    expect(deliveriesService.uploadPaymentPhoto).toHaveBeenCalledWith(
      deliveryId,
      file,
    );

    expect(result.success).toBe(true);
  });

  it('should reject when payment photo is missing', async () => {
    await expect(
      controller.uploadPaymentPhoto(deliveryId, undefined as any),
    ).rejects.toThrow(BadRequestException);

    expect(
      deliveriesService.uploadPaymentPhoto,
    ).not.toHaveBeenCalled();
  });

  it('should pass the correct delivery ID to the service', async () => {
    const file = {
      originalname: 'receipt.jpg',
      mimetype: 'image/jpeg',
      size: 2048,
      buffer: Buffer.from('test image'),
    } as Express.Multer.File;

    await controller.uploadPaymentPhoto(deliveryId, file);

    expect(
      deliveriesService.uploadPaymentPhoto.mock.calls[0][0],
    ).toBe(deliveryId);
  });
});
});


