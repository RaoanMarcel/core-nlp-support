export type CategoryRelease = 'NOVIDADE' | 'MELHORIA' | 'FIX';

export interface IReleaseNote {
  id: number;
  versao: string;
  titulo: string;
  descricao: string;
  categoria: CategoryRelease;
  createdAt: string;
}

export interface CreateReleaseDTO {
  versao: string;
  titulo: string;
  descricao: string;
  categoria: CategoryRelease;
}