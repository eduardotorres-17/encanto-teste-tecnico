import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority, { message: 'Prioridade inválida. Valores aceitos: LOW, MEDIUM, HIGH' })
  priority?: TicketPriority;
}