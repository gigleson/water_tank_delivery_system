// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';

// describe('UsersService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
// >>

import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let usersService: UsersService;
    let userModel: any;

    beforeEach(() => {
        userModel = {
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
        };

        usersService = new UsersService(userModel);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserById', () => {
        it('should return a user', async () => {
            const mockUser = {
                id: 'user123',
                fullname: 'John Doe',
                email: 'john@gmail.com',
            };

            userModel.findById.mockResolvedValue(mockUser);

            const result = await usersService.getUserById('user123');

            expect(result).toEqual(mockUser);
            expect(userModel.findById).toHaveBeenCalledWith('user123');
        });

        it('should throw NotFoundException if user does not exist', async () => {
            userModel.findById.mockResolvedValue(null);

            await expect(
                usersService.getUserById('invalid-id'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            userModel.findByIdAndDelete.mockResolvedValue({
                id: 'user123',
            });

            const result = await usersService.deleteUser('user123');

            expect(result.message).toBe('User deleted successfully');
        });

        it('should throw error if user does not exist', async () => {
            userModel.findByIdAndDelete.mockResolvedValue(null);

            await expect(
                usersService.deleteUser('invalid-id'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});

