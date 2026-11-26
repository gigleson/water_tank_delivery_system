
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


interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) {}

    @Post()
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
    async getOrders() {
        return this.ordersService.getOrders();
    }

    @Get(':id')
    async getOrderById(
       @Param('id') id: string
    ) {
        return this.ordersService.getOrderById(id);
    }
}
