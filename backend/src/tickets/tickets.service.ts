import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: User): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      user,
    });

    return await this.ticketsRepository.save(ticket);
  }

  async findAll(userId: string, titulo?: string, status?: string) {
    const whereClause: any = { user: { id: userId } };

    if (titulo) {
      whereClause.titulo = ILike(`%${titulo}%`);
    }
    if (status) {
      whereClause.status = status;
    }

    return this.ticketsRepository.find({
      where: whereClause,
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { user: true },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Ticket com ID ${id} não encontrado ou você não tem permissão para acessá-lo.`,
      );
    }

    return ticket;
  }

  async update(
    id: string,
    userId: string,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id, userId);

    Object.assign(ticket, updateTicketDto);

    return await this.ticketsRepository.save(ticket);
  }

  async remove(id: string, userId: string): Promise<void> {
    const ticket = await this.findOne(id, userId);
    await this.ticketsRepository.remove(ticket);
  }
}
