import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tickets/:ticketId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Param('ticketId') ticketId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.messagesService.create(ticketId, userId, createMessageDto);
  }

  @Get()
  findAll(@Param('ticketId') ticketId: string) {
    return this.messagesService.findByTicket(ticketId);
  }
}
