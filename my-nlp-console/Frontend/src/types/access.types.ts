export interface IPermission {
  id: string;
  slug: string;     
  descricao: string; 
  modulo: string;
}

export interface IRole {
  id: string;
  nome: string;
  permissions: string[];
}