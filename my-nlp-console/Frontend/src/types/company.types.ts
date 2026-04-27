export interface ICompany {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  email?: string | null;
  telefonePrincipal?: string | null;
  telefoneSecundario?: string | null;
  
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  
  observacoes?: string | null;
  ativo: boolean;
  
  createdAt: string;
  updatedAt: string;

  quotes?: any[];
  prospects?: any[]; 

  _count?: {
    quotes: number;
    prospects: number;
  };
}

export type ICompanyDTO = Omit<ICompany, 'id' | 'createdAt' | 'updatedAt' | 'ativo' | 'quotes' | 'prospects' | '_count'>;