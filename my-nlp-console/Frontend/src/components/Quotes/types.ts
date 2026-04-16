export interface IModulo {
  id: string;
  nome: string;
  descricao: string;
  valorBase: number;
}

export interface IQuoteNote {
  id: string;
  quoteId: number;
  texto: string;
  usuario: string;
  createdAt: string;
}

export interface IQuote {
  id: string;
  nomeCliente: string;
  cnpj: string;
  endereco?: string;
  email?: string;
  telefonePrincipal?: string;
  telefoneSecundario?: string;
  modulos: string[];
  plano: 'MENSAL' | 'ANUAL';
  valorBase: number;
  valorNegociado: number; 
  observacoes?: string;
  interesses?: string;
  status: 'RASCUNHO' | 'EM_NEGOCIACAO' | 'APROVADO' | 'REJEITADO'; 
  createdAt: string;
  notas?: IQuoteNote[];
}