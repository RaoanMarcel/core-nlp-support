export type OrderStatus = 'PENDENTE_ASSINATURA' | 'ASSINADO' | 'CANCELADO' | 'CONCLUIDO';

export interface IOrder {
  id: string;
  orderNumber: number;
  quoteId: number;
  prospectId: string;
  valorTotal: number;
  modulos: string[];
  status: OrderStatus;
  tokenAssinatura?: string;
  assinaturaUrl?: string;
  termoAceitoAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssinaturaPayload {
  token: string;
  assinaturaBase64: string;
  ipCliente?: string;
}