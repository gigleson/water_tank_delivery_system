import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../../app.module';
import {
    Users,
    UsersDocument,
    UserRole,
} from '../model/users.model';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const userModel = app.get<Model<UsersDocument>>(
            getModelToken(Users.name),
        );

        const email = 'admin@gmail.com';

        const existingAdmin = await userModel.findOne({ email });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        await userModel.create({
            fullname: 'System Admin',
            email,
            phone: '9800000000',
            password: hashedPassword,
            role: UserRole.ADMIN,
        });

        console.log('Admin created successfully');
        console.log('Email:', email);
        console.log('Password: Admin@123');

    } finally {
        await app.close();
    }
}

bootstrap();