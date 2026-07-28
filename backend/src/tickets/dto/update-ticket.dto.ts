import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsEnum(TicketStatus, { message: 'Status inválido. Valores aceitos: OPEN, IN_PROGRESS, CLOSED' })
  status?: TicketStatus;
}