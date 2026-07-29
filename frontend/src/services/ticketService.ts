import { api } from './api'; 

export interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'aberto' | 'em_andamento' | 'concluido';
}

export const getTickets = async (): Promise<TicketData[]> => {
  const response = await api.get('/tickets');
  return response.data;
};

export const updateTicketStatus = async (id: string, newStatus: string) => {
  const response = await api.patch(`/tickets/${id}/status`, { status: newStatus });
  return response.data;
};