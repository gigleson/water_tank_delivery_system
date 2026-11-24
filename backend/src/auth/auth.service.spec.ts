
import {
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Users, UserRole } from '../users/model/users.model';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let userModel: any;
    let jwtService: any;

    beforeEach(() => {
        userModel = jest.fn().mockImplementation((data) => ({
            ...data,
            id: 'user123',
            save: jest.fn().mockResolvedValue(true),
        }));

        userModel.findOne = jest.fn();

        jwtService = {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
        };

        authService = new AuthService(
            userModel,
            jwtService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signup', () => {
        it('should register a customer successfully', async () => {
            userModel.findOne.mockResolvedValue(null);

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

            const result = await authService.signup(
                'John Doe',
                'john@gmail.com',
                '9800000000',
                'password123',
            );

            expect(result.message).toBe(
                'Customer registered successfully',
            );

            expect(result.user.email).toBe('john@gmail.com');
            expect(result.user.role).toBe(UserRole.CUSTOMER);
            expect(bcrypt.hash).toHaveBeenCalled();
        });

        it('should throw error if email already exists', async () => {
            userModel.findOne.mockResolvedValue({
                email: 'john@gmail.com',
            });

            await expect(
                authService.signup(
                    'John Doe',
                    'john@gmail.com',
                    '9800000000',
                    'password123',
                ),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            userModel.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    id: 'user123',
                    email: 'john@gmail.com',
                    password: 'hashed-password',
                    role: UserRole.CUSTOMER,
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await authService.login(
                'john@gmail.com',
                'password123',
            );

            expect(result.access_token).toBe('mock-jwt-token');

            expect(jwtService.signAsync).toHaveBeenCalledWith({
                email: 'john@gmail.com',
                sub: 'user123',
                role: UserRole.CUSTOMER,
            });
        });

        it('should throw error for incorrect email', async () => {
            userModel.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await expect(
                authService.login(
                    'wrong@gmail.com',
                    'password123',
                ),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw error for incorrect password', async () => {
            userModel.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    id: 'user123',
                    email: 'john@gmail.com',
                    password: 'hashed-password',
                    role: UserRole.CUSTOMER,
                }),
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.login(
                    'john@gmail.com',
                    'wrongpassword',
                ),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
