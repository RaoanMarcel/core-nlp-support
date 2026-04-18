import { api } from './api';
import type { ReportPayload } from '../types/reports.types';

export const reportsService = {
  buildReport: async (payload: ReportPayload) => {
    const response = await api.post('/relatorios/build', payload);
    return response.data;
  }
};