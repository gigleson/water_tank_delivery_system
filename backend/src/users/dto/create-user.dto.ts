
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

import { UserRole } from '../model/users.model';

export class CreateUserDto {
    @ApiProperty({
        example: 'John Supplier',
        description: 'Full name of the user',
    })
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @ApiProperty({
        example: 'supplier@gmail.com',
        description: 'Unique email address',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        example: '9800000000',
        description: 'User phone number',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        example: 'Password123',
        minLength: 6,
        description: 'Account password',
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        enum: [UserRole.SUPPLIER, UserRole.DRIVER],
        example: UserRole.SUPPLIER,
        description: 'Role assigned to the new user',
    })
    @IsEnum([UserRole.SUPPLIER, UserRole.DRIVER])
    role: UserRole;
}
