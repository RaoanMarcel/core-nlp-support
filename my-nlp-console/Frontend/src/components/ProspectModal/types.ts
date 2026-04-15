import { type Prospect } from '../Contratos'; 

export interface Historico {
  id: string;
  acao: string;
  observacoes: string | null;
  novosModulos: string[];
  usuario: string;
  createdAt: string;
}

export interface ModalProps {
  prospect: Prospect;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  onUpdate?: (updated: Prospect) => void; 
}

export interface ContactFormState {
  telefone: string;
  telefoneSecundario: string;
  email: string;
  valor: string; 
}

export interface InteractionFormState {
  observacoes: string;
  modulos: string[];
}