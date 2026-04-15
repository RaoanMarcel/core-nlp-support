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
}

export interface ContactFormState {
  telefone: string;
  telefoneSecundario: string;
  email: string;
  valor: string; // Novo campo para gerenciar o input
}

export interface InteractionFormState {
  observacoes: string;
  modulos: string[];
}