
import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
    Users,
    UsersDocument,
    UserRole,
} from './model/users.model';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name)
        private userModel: Model<UsersDocument>,
    ) {}

    // Create supplier or driver
    async createUser(dto: CreateUserDto) {
        const existingUser = await this.userModel.findOne({
            email: dto.email.toLowerCase().trim(),
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        try {
            const user = await this.userModel.create({
                fullname: dto.fullname,
                email: dto.email,
                phone: dto.phone,
                password: hashedPassword,
                role: dto.role as UserRole,
            });

            return {
                message: 'User created successfully',
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            };
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    // Get all users with pagination
    async getAllUsers(page = 1, limit = 10) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.min(100, Math.max(1, Number(limit) || 10));

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.userModel
                .find()
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            this.userModel.countDocuments(),
        ]);

        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get user by ID
    async getUserById(id: string) {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    // Update user
    async updateUser(id: string, dto: UpdateUserDto) {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (dto.email) {
            const existingUser = await this.userModel.findOne({
                email: dto.email.toLowerCase().trim(),
                _id: { $ne: id },
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            user.email = dto.email.toLowerCase().trim();
        }

        if (dto.fullname !== undefined) {
            user.fullname = dto.fullname;
        }

        if (dto.phone !== undefined) {
            user.phone = dto.phone;
        }

        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
        }

        try {
            await user.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }

        return {
            message: 'User updated successfully',
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    // Delete user
    async deleteUser(id: string) {
        const user = await this.userModel.findByIdAndDelete(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'User deleted successfully',
        };
    }
}
