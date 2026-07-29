import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from 'src/ai/ai.service';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('titulo') titulo?: string,
    @Query('status') status?: string,
  ) {
    return this.ticketsService.findAll(req.user, titulo, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.ticketsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, req.user, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketsService.remove(id, req.user);
  }

  @Post(':id/ai-suggestion')
  async getAiSuggestion(@Body() body: { description: string }) {
    const suggestion = await this.aiService.generateSuggestion(
      body.description,
    );
    return { suggestion };
  }
}
