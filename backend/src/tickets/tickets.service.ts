import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: User): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      user,
    });

    return await this.ticketsRepository.save(ticket);
  }

  async findAll(
    status?: TicketStatus,
    priority?: TicketPriority,
  ): Promise<Ticket[]> {
    const query = this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .select(['ticket', 'user.id', 'user.name', 'user.email']);

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', { priority });
    }

    query.orderBy('ticket.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket com ID ${id} não encontrado.`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    Object.assign(ticket, updateTicketDto);

    return await this.ticketsRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepository.remove(ticket);
  }
}
