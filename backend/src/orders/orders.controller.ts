
import {
    Body,
    Controller,
    Get,
    Post,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';


interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
@ApiResponse({ status: 201, description: 'Order created successfully' })
@ApiResponse({ status: 400, description: 'Invalid order data' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
    async createOrder(
        @Req() req: AuthenticatedRequest,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        console.log('Authenticated user:', req.user);
        return this.ordersService.createOrder(
            req.user.userId,
            createOrderDto,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders' })
@ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
    async getOrders() {
        return this.ordersService.getOrders();
    }

    @Get(':id')
    @ApiOperation({
    summary: 'Get an order by MongoDB ID or order number',
})
@ApiParam({
    name: 'id',
    example: 'ORD-1795687226363',
    description: 'MongoDB ObjectId or custom order number',
})
@ApiResponse({ status: 200, description: 'Order retrieved successfully' })
@ApiResponse({ status: 404, description: 'Order not found' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
    async getOrderById(
       @Param('id') id: string
    ) {
        return this.ordersService.getOrderById(id);
    }
}
