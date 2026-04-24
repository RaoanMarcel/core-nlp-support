import { api } from './api';
import type { Plan, CreatePlanDTO } from '../types/plan.types';
import { handleAuthError } from './prospect.service';

export const planService = {
  getPlans: async (nome?: string): Promise<Plan[]> => {
    try {
      const response = await api.get('/plans', {
        params: nome ? { nome, t: new Date().getTime() } : { t: new Date().getTime() },
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.data;
    } catch (error) {
      return handleAuthError(error);
    }
  },

  createPlan: async (data: CreatePlanDTO): Promise<Plan> => {
    try {
      const response = await api.post('/plans', data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  updatePlan: async (id: string, data: Partial<CreatePlanDTO>): Promise<Plan> => {
    try {
      const response = await api.put(`/plans/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  }
};