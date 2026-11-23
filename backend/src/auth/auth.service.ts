
import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Users, UsersDocument, UserRole } from '../users/model/users.model';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Users.name)
        private userModel: Model<UsersDocument>,
        private jwtService: JwtService,
    ) {}

    // CUSTOMER signup
    async signup(
        fullname: string,
        email: string,
        phone: string,
        password: string,
    ) {
        email = email.trim().toLowerCase();

        const existingUser = await this.userModel.findOne({ email });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hash = await bcrypt.hash(password, 10);

        const user = new this.userModel({
            fullname,
            email,
            phone,
            password: hash,
            role: UserRole.CUSTOMER,
        });

        await user.save();

        return {
            message: 'Customer registered successfully',
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            },
        };
    }

    // Login for ALL roles
    async login(email: string, password: string) {
        const user = await this.userModel
            .findOne({ email: email.trim().toLowerCase() })
            .select('+password');

        if (!user) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isMatch) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
        };

        return {
            message: 'Login successful',
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            },
        };
    }
}
