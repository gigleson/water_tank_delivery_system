
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'John Updated',
        description: 'Updated full name',
    })
    @IsOptional()
    @IsString()
    fullname?: string;

    @ApiPropertyOptional({
        example: 'john@gmail.com',
        description: 'Updated email address',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: '9811111111',
        description: 'Updated phone number',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        example: 'NewPassword123',
        minLength: 6,
        description: 'New account password',
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}
