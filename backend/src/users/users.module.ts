import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './model/users.model';

@Module({
  imports :[
    MongooseModule.forFeature([
                {
                    name: Users.name,
                    schema: UsersSchema,
                },
            ]),
  ],
  
  controllers: [UsersController],
  providers: [UsersService],
  exports:[
    UsersService,
    MongooseModule
  ]
})
export class UsersModule {}
