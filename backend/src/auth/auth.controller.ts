import { Body, Controller, Get, Post, UseGuards,Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    @Post('signup')
    signup(@Body() body:{fullname:string,email:string ,phone:string,password:string}){
        return this.authService.signup(body.fullname,body.email,body.phone,body.password,)
    }
    @Post('login')
    login(@Body() body:{email:string ,password:string}){
        return this.authService.login(body.email,body.password)
    }
    @UseGuards(AuthGuard("jwt"))
    @Get('profile')
    getProfile(@Request() req:any){
        return req.user;
    }

}

