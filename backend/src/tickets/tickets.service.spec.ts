import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

const mockTicketRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e retornar um novo ticket', async () => {
      const createTicketDto = {
        title: 'Teste de Ticket',
        description: 'Descrição do ticket de teste',
        status: 'OPEN',
        priority: 'HIGH',
      };
      const mockUser = { id: '1', email: 'teste@teste.com' };
      const ticketSalvo = { id: '1', ...createTicketDto, user: mockUser };

      mockTicketRepository.create.mockReturnValue(ticketSalvo);
      mockTicketRepository.save.mockResolvedValue(ticketSalvo);

      const result = await service.create(
        createTicketDto as any,
        mockUser as any,
      );

      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        ...createTicketDto,
        user: mockUser,
      });
      expect(mockTicketRepository.save).toHaveBeenCalledWith(ticketSalvo);
      expect(result).toEqual(ticketSalvo);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma matriz (array) de tickets', async () => {
      const mockUserId = '1';
      const listaDeTickets = [
        { id: '1', title: 'Ticket 1', status: 'OPEN' },
        { id: '2', title: 'Ticket 2', status: 'IN_PROGRESS' },
      ];

      mockTicketRepository.find.mockResolvedValue(listaDeTickets);

      const result = await service.findAll(mockUserId);

      expect(mockTicketRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        order: { id: 'DESC' },
      });
      expect(result).toEqual(listaDeTickets);
    });
  });

  describe('findOne', () => {
    it('deve retornar um ticket pelo ID', async () => {
      const ticketId = '1';
      const mockUserId = '1';
      const ticketMock = { id: ticketId, title: 'Ticket 1', status: 'OPEN' };

      mockTicketRepository.findOne.mockResolvedValue(ticketMock);

      const result = await service.findOne(ticketId, mockUserId);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId, user: { id: mockUserId } },
        relations: { user: true },
      });
      expect(result).toEqual(ticketMock);
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o ticket', async () => {
      const ticketId = '1';
      const mockUserId = '1';
      const updateTicketDto = { status: 'IN_PROGRESS' };
      const ticketExistente = {
        id: ticketId,
        title: 'Ticket Antigo',
        status: 'OPEN',
      };
      const ticketAtualizado = { ...ticketExistente, ...updateTicketDto };

      mockTicketRepository.findOne.mockResolvedValue(ticketExistente);
      mockTicketRepository.save.mockResolvedValue(ticketAtualizado);

      const result = await service.update(
        ticketId,
        mockUserId,
        updateTicketDto as any,
      );

      expect(result).toEqual(ticketAtualizado);
    });
  });

  describe('remove', () => {
    it('deve remover um ticket com sucesso', async () => {
      const ticketId = '1';
      const mockUserId = '1';
      const ticketExistente = { id: ticketId, title: 'Ticket para deletar' };

      mockTicketRepository.findOne.mockResolvedValue(ticketExistente);
      mockTicketRepository.remove.mockResolvedValue(ticketExistente);

      await service.remove(ticketId, mockUserId);

      expect(mockTicketRepository.remove).toHaveBeenCalledWith(ticketExistente);
    });
  });
});
