import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Ticket])],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
