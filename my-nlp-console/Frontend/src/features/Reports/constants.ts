import type { ReportModuleConfig } from '../../types/reports.types';

export const REPORT_MODULES: Record<string, ReportModuleConfig> = {
  prospects: {
    label: 'Prospecção e Vendas',
    dimensions: [
      { id: 'status', label: 'Status do Atendimento' },
      { id: 'nome', label: 'Razão Social' },
      { id: 'nomeFantasia', label: 'Nome Fantasia' },
      { id: 'cnpj', label: 'CNPJ' },
      { id: 'telefone', label: 'Telefone Principal' },
      { id: 'telefoneSecundario', label: 'Telefone Secundário' },
      { id: 'telefoneBackup', label: 'Telefone Backup' },
      { id: 'email', label: 'E-mail' },
      { id: 'atividadePrincipal', label: 'Atividade Principal' },
      { id: 'simplesNacional', label: 'Simples Nacional?' },
      { id: 'situacaoCadastral', label: 'Situação Cadastral' },
      { id: 'endereco', label: 'Endereço' },
      { id: 'valor', label: 'Valor' },
      { id: 'clienteWLE', label: 'Cliente WLE?' },
      { id: 'modulosAtuais', label: 'Módulos Atuais' },
      { id: 'novosModulos', label: 'Módulos de Interesse (Novos)' },
      { id: 'observacoes', label: 'Observações' },
      { id: 'lockedBy', label: 'Em Atendimento Por (Travado)' },
      { id: 'atendidoPor', label: 'Finalizado Por' },
      { id: 'dataAtendimento', label: 'Data de Atendimento' },
      { id: 'createdAt', label: 'Data de Entrada' },
      { id: 'updatedAt', label: 'Última Atualização' }
    ],
    metrics: [
      { id: 'volume', label: 'Quantidade (1 por linha)' }
    ]
  }
};

export const ITEMS_PER_PAGE = 15;