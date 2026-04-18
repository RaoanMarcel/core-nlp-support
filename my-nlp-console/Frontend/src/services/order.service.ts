import { api } from './api'; 

export const OrderService = {
  
  gerarPedido: async (quoteId: string | number) => {
    const response = await api.post('/orders/gerar', { quoteId });
    return response.data;
  },

  buscarDadosTermo: async (tokenAssinatura: string) => {
    const response = await api.get(`/orders/publico/${tokenAssinatura}`);
    return response.data;
  },

  assinarPedido: async (tokenAssinatura: string, assinaturaBase64: string) => {
    const response = await api.post(`/orders/publico/${tokenAssinatura}/assinar`, {
      assinaturaBase64
    });
    return response.data;
  }
};