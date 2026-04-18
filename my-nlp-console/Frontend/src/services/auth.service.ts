import { api } from './api';
import type { LoginResponse } from '../types/auth.types';

export const authService = {
  login: async (usuario: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { usuario, senha });
    return response.data;
  },

  trocarSenhaPrimeiroAcesso: async (usuario: string, senhaAtual: string, novaSenha: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/primeiro-acesso', { 
      usuario, 
      senhaAtual, 
      novaSenha 
    });
    return response.data;
  }
};