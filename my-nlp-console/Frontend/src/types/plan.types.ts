export interface Plan {
  id: string;
  nome: string;
  modulosInclusos: string[];
  quantidadeUsuarios: number;
  descricao?: string;
  valorBase: number;
  percentualPorCnpj: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDTO extends Omit<Plan, 'id' | 'createdAt' | 'updatedAt'> {}