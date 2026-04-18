import { api } from './api';
import type { Prospect } from '../types/prospect.types';

export const handleAuthError = (error: any) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('@CRM:token');
    localStorage.removeItem('@CRM:user');
    window.location.reload();
    throw new Error('Não autorizado');
  }
  throw error;
};

export const prospectService = {
  getProspects: async (): Promise<Prospect[]> => {
    try {
      const response = await api.get('/prospects', {
        params: { t: new Date().getTime() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },

  importCSV: async (clientes: any[]): Promise<void> => {
    try {
      await api.post('/prospects/importar', { clientes });
    } catch (error) {
      handleAuthError(error);
    }
  },

  lockProspect: async (prospectId: string, userId: string, userName: string): Promise<Prospect> => {
    try {
      const response = await api.put(`/prospects/${prospectId}/travar`, { userId, userName });
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  }
};