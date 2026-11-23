
import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() body: SignupDto) {
        return this.authService.signup(
            body.fullname,
            body.email,
            body.phone,
            body.password,
        );
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(
            body.email,
            body.password,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
