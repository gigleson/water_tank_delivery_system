import {
    BadRequestException,
    Controller,
    Post,
    Param,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { paymentPhotoUploadConfig } from './config/payment-photo.config';
import { DeliveriesService } from './deliveries.service';

@Controller('deliveries')
export class DeliveriesController {
    constructor(private deliveriesService: DeliveriesService) {}

@Post(':id/payment-photo')
@UseInterceptors(
    FileInterceptor('paymentPhoto', paymentPhotoUploadConfig),
)
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

}
