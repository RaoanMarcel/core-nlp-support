import { api } from './api'; 
import type { IQuote, IQuoteNote } from '../components/Quotes/types';

export const QuoteService = {
  list: async (): Promise<IQuote[]> => {
    const { data } = await api.get('/quotes');
    return data;
  },

  consultar: async (filtros: { termo?: string; status?: string; dataInicio?: string; dataFim?: string }): Promise<IQuote[]> => {
    const { data } = await api.get('/quotes/consultar', { params: filtros });
    return data;
  },

  getById: async (id: number): Promise<IQuote> => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },

  create: async (quoteData: Partial<IQuote>): Promise<IQuote> => {
    const { data } = await api.post('/quotes', quoteData);
    return data;
  },

  update: async (id: number, quoteData: Partial<IQuote>): Promise<IQuote> => {
    const { data } = await api.put(`/quotes/${id}`, quoteData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  addNote: async (id: number, texto: string, usuario: string): Promise<IQuoteNote> => {
    const { data } = await api.post(`/quotes/${id}/notas`, { texto, usuario });
    return data;
  },

  forceStatusUpdate: async (id: number, novoStatus: string, usuarioLogin: string, senha: string): Promise<any> => {
  const { data } = await api.patch(`/quotes/${id}/force-status`, {
    novoStatus,
    usuarioLogin,
    senha
  });
  return data; 
}
}