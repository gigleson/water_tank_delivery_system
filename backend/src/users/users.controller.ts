
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
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')

@UseGuards(AuthGuard('jwt'), AdminGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    // Create supplier or driver
    @Post()
    @ApiOperation({ summary: 'Create a supplier or driver' })
@ApiResponse({ status: 201, description: 'User created successfully' })
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    // Get all users
    @Get()
    @ApiOperation({ summary: 'Get all users with pagination' })
@ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    getAllUsers(
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return this.usersService.getAllUsers(page, limit);
    }

    // Get user by ID
    @Get(':id')
    @ApiOperation({ summary: 'Get one users with id' })
@ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    getUserById(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    // Update user
    @Patch(':id')
    @ApiOperation({ summary: 'Upadte one users with id' })
@ApiResponse({ status: 200, description: 'Users updated successfully' })
    updateUser(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.updateUser(id, dto);
    }

    // Delete user
    @Delete(':id')
    @ApiOperation({ summary: 'Delete users with id' })
@ApiResponse({ status: 200, description: 'Users deleted successfully' })
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
