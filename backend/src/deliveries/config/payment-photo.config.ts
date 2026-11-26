
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { memoryStorage } from 'multer';

export const paymentPhotoUploadConfig = {
    storage: memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1,
    },

    fileFilter: (
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new Error('Only JPEG, PNG and WEBP images are allowed'),
                false,
            );
        }

        callback(null, true);
    },
};

export const generatePaymentPhotoFilename = (
    originalName: string,
): string => {
    return `${randomUUID()}${extname(originalName).toLowerCase()}`;
};
