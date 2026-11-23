
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from './model/users.model';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users.name)
        private userModle: Model<UsersDocument>,
        private jwtService: JwtService,
    ) {}

    async signup(fullname :string, email: string, phone:string,password: string) {
        const existingUser = await this.userModle.findOne({ email });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hash = await bcrypt.hash(password, 10);

        const user = new this.userModle({
            fullname,
            email,
            password: hash,
            phone
        });

        await user.save();

        return {
            message: 'User registered successfully',
            user: {
                
                id: user.id,
                email: user.email,
            },
        };
    }

    async login(email: string, password: string) {
        const user = await this.userModle.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = {
            email: user.email,
            sub: user.id,
        };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
