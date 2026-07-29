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

const mockUser = {
  id: '1',
  email: 'teste@teste.com',
  role: 'client',
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

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e retornar um novo ticket', async () => {
      const createTicketDto = {
        title: 'Teste de Ticket',
        description: 'Descrição do ticket de teste',
        priority: 'HIGH',
        status: 'OPEN',
      };

      const savedTicket = { id: '1', ...createTicketDto, user: mockUser };
      mockTicketRepository.create.mockReturnValue(savedTicket);
      mockTicketRepository.save.mockResolvedValue(savedTicket);

      const result = await service.create(createTicketDto, mockUser as any);

      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        ...createTicketDto,
        user: { id: mockUser.id },
      });
      expect(mockTicketRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('deve retornar uma matriz (array) de tickets', async () => {
      mockTicketRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUser as any);

      expect(mockTicketRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        order: { id: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um ticket pelo ID', async () => {
      const ticketId = '1';
      mockTicketRepository.findOne.mockResolvedValue({ id: ticketId });

      const result = await service.findOne(ticketId, mockUser as any);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId, user: { id: mockUser.id } },
        relations: { user: true },
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o ticket', async () => {
      const ticketId = '1';
      const updateTicketDto = { status: 'IN_PROGRESS' };

      const mockSupportUser = {
        id: '2',
        email: 'suporte@teste.com',
        role: 'support',
      };

      const ticketExistente = { id: ticketId, status: 'OPEN' };

      jest.spyOn(service, 'findOne').mockResolvedValue(ticketExistente as any);

      mockTicketRepository.save.mockResolvedValue({
        ...ticketExistente,
        ...updateTicketDto,
      });
      mockTicketRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        ticketId,
        updateTicketDto as any,
        mockSupportUser as any,
      );

      expect(result).toBeDefined();

      const saveChamado = mockTicketRepository.save.mock.calls.length > 0;
      const updateChamado = mockTicketRepository.update.mock.calls.length > 0;

      expect(saveChamado || updateChamado).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('deve remover um ticket com sucesso', async () => {
      const ticketId = '1';
      const mockUserId = '1';
      const ticketExistente = { id: ticketId, title: 'Ticket para deletar' };

      mockTicketRepository.findOne.mockResolvedValue(ticketExistente);
      mockTicketRepository.remove.mockResolvedValue(ticketExistente);

      await service.remove(ticketId, mockUserId as any);

      expect(mockTicketRepository.remove).toHaveBeenCalledWith(ticketExistente);
    });
  });
});
