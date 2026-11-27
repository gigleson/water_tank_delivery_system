import {
    BadRequestException,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Patch,
    Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { paymentPhotoUploadConfig } from './config/payment-photo.config';
// import { DeliveriesService } from './deliveries.service';


import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiProduces,
    ApiConsumes,
} from '@nestjs/swagger';

import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Deliveries')
@ApiBearerAuth()
@Controller('deliveries')
@UseGuards(AuthGuard('jwt'))
export class DeliveriesController {
    constructor(
        private readonly deliveriesService: DeliveriesService,
    ) {}

    // CREATE DELIVERY
    @Post()
    @ApiOperation({
        summary: 'Create a delivery',
        description: 'Creates a delivery linked to an existing order.',
    })
    @ApiResponse({
        status: 201,
        description: 'Delivery created successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid order or driver ID',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 404,
        description: 'Order or driver not found',
    })
    async createDelivery(
        @Body() createDeliveryDto: CreateDeliveryDto,
    ) {
        return this.deliveriesService.createDelivery(
            createDeliveryDto,
        );
    }

    // GET ALL DELIVERIES
    @Get()
    @ApiOperation({
        summary: 'Get all deliveries',
    })
    @ApiResponse({
        status: 200,
        description: 'Deliveries retrieved successfully',
    })
    async getDeliveries() {
        return this.deliveriesService.getDeliveries();
    }

    // GET DELIVERY BY ID
    @Get(':id')
    @ApiOperation({
        summary: 'Get delivery by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'MongoDB delivery ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Delivery retrieved successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Delivery not found',
    })
    async getDeliveryById(
        @Param('id') id: string,
    ) {
        return this.deliveriesService.getDeliveryById(id);
    }

@Post(':id/payment-photo')
@UseInterceptors(
  FileInterceptor('paymentPhoto', paymentPhotoUploadConfig),
)
@ApiOperation({
  summary: 'Upload delivery payment photo',
  description:
    'Uploads a payment receipt image for a delivery. ' +
    'Only JPEG, PNG and WEBP images up to 5 MB are accepted.',
})
@ApiParam({
  name: 'id',
  description: 'MongoDB delivery ID',
  example: '6b0811e89538b652cf4d05d1',
})
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      paymentPhoto: {
        type: 'string',
        format: 'binary',
        description: 'Payment receipt image (JPEG, PNG or WEBP)',
      },
    },
    required: ['paymentPhoto'],
  },
})
@ApiResponse({
  status: 200,
  description: 'Payment photo uploaded successfully',
})
@ApiResponse({
  status: 400,
  description: 'Missing file, invalid file type or file too large',
})
@ApiResponse({
  status: 404,
  description: 'Delivery not found',
})
async uploadPaymentPhoto(
  @Param('id') id: string,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 5 * 1024 * 1024,
        }),
        new FileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        }),
      ],
    }),
  )
  file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Payment photo is required');
  }

  return this.deliveriesService.uploadPaymentPhoto(id, file);
}



@Patch(':id/status')
@ApiOperation({
  summary: 'Update delivery status',
  description:
    'Allows an assigned driver or admin to update delivery status. ' +
    'Valid transitions: ASSIGNED → ACCEPTED → ON_THE_WAY → DELIVERED. ' +
    'FAILED is also allowed from ACCEPTED or ON_THE_WAY.',
})
@ApiParam({
  name: 'id',
  description: 'MongoDB delivery ID',
  example: '6b0811e89538b652cf4d05d1',
})
@ApiBody({
  type: UpdateDeliveryStatusDto,
  examples: {
    accept: {
      summary: 'Accept delivery',
      value: { deliveryStatus: 'ACCEPTED' },
    },
    onTheWay: {
      summary: 'Start delivery',
      value: { deliveryStatus: 'ON_THE_WAY' },
    },
    delivered: {
      summary: 'Complete delivery',
      value: { deliveryStatus: 'DELIVERED' },
    },
  },
})
@ApiResponse({
  status: 200,
  description: 'Delivery status updated successfully',
})
@ApiResponse({
  status: 400,
  description: 'Invalid status transition',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 403,
  description: 'User is not allowed to update this delivery',
})
@ApiResponse({
  status: 404,
  description: 'Delivery not found',
})
async updateDeliveryStatus(
  @Param('id') id: string,
  @Body() dto: UpdateDeliveryStatusDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.deliveriesService.updateDeliveryStatus(
    id,
    dto.deliveryStatus,
    req.user.userId,
    req.user.role,
  );
}

@Get(':id/payment-photo')
@ApiOperation({
  summary: 'Retrieve delivery payment photo',
  description: 'Returns the uploaded payment photo as an image.',
})
@ApiParam({
  name: 'id',
  description: 'MongoDB delivery ID',
})
@ApiProduces('image/jpeg', 'image/png', 'image/webp')
@ApiResponse({
  status: 200,
  description: 'Payment photo retrieved successfully',
  content: {
    'image/jpeg': {
      schema: { type: 'string', format: 'binary' },
    },
    'image/png': {
      schema: { type: 'string', format: 'binary' },
    },
    'image/webp': {
      schema: { type: 'string', format: 'binary' },
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Delivery or payment photo not found',
})
async getPaymentPhoto(
  @Param('id') id: string,
) {
  return this.deliveriesService.getPaymentPhoto(id);
}
}