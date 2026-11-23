
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
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsEnum([UserRole.SUPPLIER, UserRole.DRIVER])
    role: UserRole;
}

