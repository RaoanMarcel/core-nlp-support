// Frontend/src/features/Quotes/QuoteModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuoteModal from './QuoteModal';
import { ToastProvider } from '../../contexts/ToastContext';

// 1. Mock (Falsificação) das chamadas de API
vi.mock('../../services/api', () => ({
  api: { post: vi.fn(), put: vi.fn() }
}));

vi.mock('../../services/plan.service', () => ({
  planService: { 
    getPlans: vi.fn().mockResolvedValue([
      { id: '1', nome: 'Plano Ouro', valorBase: 1000, quantidadeUsuarios: 5, modulosInclusos: [] }
    ]) 
  }
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    {children}
  </ToastProvider>
);

describe('QuoteModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o modal com o título de Novo Orçamento', async () => {
    render(<QuoteModal quote={null} onClose={mockOnClose} />, { wrapper: Wrapper });
    
    // Resolvemos o act() warning mandando o teste aguardar a tela assíncrona "estabilizar"
    await waitFor(() => {
      expect(screen.getByText('Novo Orçamento')).toBeInTheDocument();
    });
  });

it('não deve permitir valores negativos no input de Usuários Extras', async () => {
    const user = userEvent.setup();
    render(<QuoteModal quote={null} onClose={mockOnClose} />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Novo Orçamento')).toBeInTheDocument());

    // Agora buscamos pelo Label associado ao input (mais seguro)
    const inputUsuariosExtras = screen.getByLabelText(/Usuários Extras/i);

    await user.clear(inputUsuariosExtras);
    await user.type(inputUsuariosExtras, '-10');

    // No Jest-DOM, um input type="number" vazio/inválido retorna 'null'
    expect(inputUsuariosExtras).toHaveValue(null);
  });

  it('não deve permitir valores negativos no input de Valor por Usuário', async () => {
    const user = userEvent.setup();
    render(<QuoteModal quote={null} onClose={mockOnClose} />, { wrapper: Wrapper });

    await waitFor(() => expect(screen.getByText('Novo Orçamento')).toBeInTheDocument());

    const inputValorExtra = screen.getByLabelText(/Valor por Usuário/i);

    await user.clear(inputValorExtra);
    await user.type(inputValorExtra, '-50');

    expect(inputValorExtra).toHaveValue(null);
  });

  it('deve manter o botão Salvar desabilitado se os campos obrigatórios estiverem vazios', async () => {
    render(<QuoteModal quote={null} onClose={mockOnClose} />, { wrapper: Wrapper });
    
    await waitFor(() => expect(screen.getByText('Novo Orçamento')).toBeInTheDocument());

    const botaoSalvar = screen.getByRole('button', { name: /Salvar Orçamento/i });
    expect(botaoSalvar).toBeDisabled();
  });
});