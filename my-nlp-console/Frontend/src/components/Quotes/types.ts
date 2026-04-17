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

// AQUI ESTÁ A INTERFACE! Ela tem que viver neste arquivo.
export interface IQuoteHistory {
  id: string;
  quoteId: number;
  acao: string;
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
  historico?: IQuoteHistory[]; // Agora ele encontra a interface logo acima!
}