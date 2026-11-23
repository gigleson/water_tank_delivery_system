
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    // Create supplier or driver
    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    // Get all users
    @Get()
    getAllUsers(
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return this.usersService.getAllUsers(page, limit);
    }

    // Get user by ID
    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    // Update user
    @Patch(':id')
    updateUser(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(id, dto);
    }

    // Delete user
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
