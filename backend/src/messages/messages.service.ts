import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Ticket } from '../tickets/entities/ticket.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async create(
    ticketId: string,
    userId: string,
    createMessageDto: CreateMessageDto,
  ) {

    const ticket = await this.ticketsRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const message = this.messagesRepository.create({
      text: createMessageDto.text,
      ticket: { id: ticketId },
      author: { id: userId },
    });

    return this.messagesRepository.save(message);
  }

  async findByTicket(ticketId: string) {
    return this.messagesRepository.find({
      where: { ticket: { id: ticketId } },
      relations: { author: true }, 
      order: { createdAt: 'ASC' },
    });
  }
}
