import { api } from './api'; 
import type { IQuote, IQuoteNote } from '../components/Quotes/types';

export const QuoteService = {
  // Lista todos
  list: async (): Promise<IQuote[]> => {
    const { data } = await api.get('/quotes');
    return data;
  },

  // Consulta com filtros
  consultar: async (filtros: { termo?: string; status?: string; dataInicio?: string; dataFim?: string }): Promise<IQuote[]> => {
    const { data } = await api.get('/quotes/consultar', { params: filtros });
    return data;
  },

  // Busca 1 orçamento pelo ID (trazendo as notas)
  getById: async (id: number): Promise<IQuote> => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },

  // Cria orçamento
  create: async (quoteData: Partial<IQuote>): Promise<IQuote> => {
    const { data } = await api.post('/quotes', quoteData);
    return data;
  },

  // Atualiza orçamento
  update: async (id: number, quoteData: Partial<IQuote>): Promise<IQuote> => {
    const { data } = await api.put(`/quotes/${id}`, quoteData);
    return data;
  },

  // Deleta orçamento
  delete: async (id: number): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  // Adiciona nota a um orçamento
  addNote: async (id: number, texto: string, usuario: string): Promise<IQuoteNote> => {
    const { data } = await api.post(`/quotes/${id}/notas`, { texto, usuario });
    return data;
  }
};