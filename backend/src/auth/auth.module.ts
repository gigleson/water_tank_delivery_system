
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './model/users.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategie';

@Module({
    imports: [
        ConfigModule,

        MongooseModule.forFeature([
            {
                name: Users.name,
                schema: UsersSchema,
            },
        ]),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                },
            }),
        }),
    ],

    controllers: [AuthController],

    providers: [AuthService,JwtStrategy],

    exports: [AuthService],
})
export class AuthModule {}
