
import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';

export class SignupDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Customer full name',
    })
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @ApiProperty({
        example: 'john@gmail.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '9800000000',
    })
    @IsString()
    phone: string;

    @ApiProperty({
        example: 'Password123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
