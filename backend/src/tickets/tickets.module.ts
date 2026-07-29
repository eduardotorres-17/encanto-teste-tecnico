import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { AiService } from 'src/ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketsController],
  providers: [TicketsService, AiService],
})
export class TicketsModule {}
