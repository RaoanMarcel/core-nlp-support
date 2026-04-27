import { api } from './api';
import type { ICompany, ICompanyDTO } from '../types/company.types';

export interface PaginatedCompanies {
  data: ICompany[];
  total: number;
  page: number;
  totalPages: number;
}

export const companyService = {
  getAll: async (params?: { termo?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedCompanies> => {
    const response = await api.get<PaginatedCompanies>('/companies', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ICompany> => {
    const response = await api.get<ICompany>(`/companies/${id}`);
    return response.data;
  },

  create: async (data: ICompanyDTO): Promise<ICompany> => {
    const response = await api.post<ICompany>('/companies', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ICompanyDTO>): Promise<ICompany> => {
    const response = await api.put<ICompany>(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string; company: ICompany }> => {
    const response = await api.delete<{ message: string; company: ICompany }>(`/companies/${id}`);
    return response.data;
  }
};