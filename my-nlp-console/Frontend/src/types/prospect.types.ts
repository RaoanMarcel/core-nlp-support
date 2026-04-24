export interface Prospect {
  id: string;
  cnpj: string;
  nome: string; 
  nomeFantasia?: string; 
  endereco?: string;
  bairro?: string;   
  cidade?: string;   
  estado?: string;   
  cep?: string;      
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO' | 'POSSIBILIDADE' | 'RETORNAR' | 'CNPJ_BAIXADO';
  lockedBy?: string;
  
  simplesNacional?: string;
  situacaoCadastral?: string;
  telefoneSecundario?: string;
  email?: string;
  atividadePrincipal?: string;
  telefoneBackup?: string;

  observacoes?: string;
  novosModulos?: string[] | string;
  clienteWLE?: boolean; 
  
  atendidoPor?: string;
  dataAtendimento?: string | Date;
  valor?: number | null; 
  updatedAt?: string; 
}