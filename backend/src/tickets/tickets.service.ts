import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, user: any): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...createTicketDto,
      user: { id: user.id || user.sub },
    });

    return await this.ticketsRepository.save(ticket);
  }

  async findAll(user: any, titulo?: string, status?: string) {
    const whereClause: any = {};

    if (user.role !== 'support') {
      whereClause.user = { id: user.id || user.sub };
    }

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

  async findOne(id: string, user: any): Promise<Ticket> {
    const whereClause: any = { id };

    if (user.role !== 'support') {
      whereClause.user = { id: user.id || user.sub };
    }

    const ticket = await this.ticketsRepository.findOne({
      where: whereClause,
      relations: { user: true },
    });

    if (!ticket) {
      throw new NotFoundException();
    }

    return ticket;
  }

  async update(
    id: string,
    user: any,
    updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    if (updateTicketDto.status && user.role !== 'support') {
      throw new ForbiddenException();
    }

    const ticket = await this.findOne(id, user);

    Object.assign(ticket, updateTicketDto);

    return await this.ticketsRepository.save(ticket);
  }

  async remove(id: string, user: any): Promise<void> {
    const ticket = await this.findOne(id, user);
    await this.ticketsRepository.remove(ticket);
  }
}
