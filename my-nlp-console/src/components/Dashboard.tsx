import React from 'react';
import BentoCard from './BentoCard';

// Mock de dados direto em JSX por enquanto
const mockMetrics = { total: 124, criticos: 3, accuracy: 94.2 };

// Helper para badges coloridos
function StatusBadge({ status }: { status: string }) {
  const mapping = {
    'Aberto': 'bg-rose-100 text-rose-800',
    'Em Análise': 'bg-amber-100 text-amber-900',
    'Resolvendo': 'bg-teal-100 text-teal-800',
  };
  const color = mapping[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${color}`}>
      {status}
    </span>
  );
}

// Helper para barra de progresso de acurácia
function AccuracyProgress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
      <span className="text-sm font-bold text-slate-600">{value}%</span>
    </div>
  );
}

// Componente de Tabela Profissional (Zero HTML bruto injetado)
function TicketTable({ tickets }: { tickets: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="border-b border-slate-100">
        <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          <th className="py-4">ID</th>
          <th className="py-4">Assunto</th>
          <th className="py-4">Triagem NLP</th>
          <th className="py-4">Acurácia</th>
          <th className="py-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
            <td className="py-5 text-sm font-bold text-sky-700">{ticket.id}</td>
            <td className="py-5 text-sm font-semibold text-slate-950">{ticket.assunto}</td>
            <td className="py-5">{ticket.triagem}</td>
            <td className="py-5"><AccuracyProgress value={ticket.acuracia} /></td>
            <td className="py-5"><StatusBadge status={ticket.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Mocks de Tickets para Fila Prioritária e Todos os Tickets
const mockUrgentes = [
  { id: '#1042', assunto: 'Falha no Checkout', triagem: 'Bug Crítico', acuracia: 98, status: 'Aberto' },
  { id: '#1043', assunto: 'Lentidão no Relatório', triagem: 'Performance', acuracia: 85, status: 'Em Análise' },
];

const mockTodos = [
  ...mockUrgentes,
  { id: '#1044', assunto: 'Erro de Login SSO', triagem: 'Autenticação', acuracia: 92, status: 'Resolvendo' },
  { id: '#1045', assunto: 'Dúvida sobre Faturamento', triagem: 'Dúvida', acuracia: 70, status: 'Aberto' },
  { id: '#1046', assunto: 'API Timeout', triagem: 'Performance', acuracia: 88, status: 'Resolvendo' },
];

export default function Dashboard() {
  return (
    <div className="flex w-full gap-10">
      
      {/* 1. Sidebar Profissional (Alto Contraste) */}
      <aside className="w-64 shrink-0 flex flex-col gap-4">
        <div className="bg-slate-950 text-white rounded-[24px] p-8 shadow-xl">
          <h2 className="text-xl font-extrabold tracking-tight mb-8">Core NLP Console</h2>
          <nav className="flex flex-col gap-3">
            <a href="#" className="bg-emerald-500/15 text-emerald-300 font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-inner">
              Painel Inicial
            </a>
            <a href="#" className="hover:bg-slate-800 text-slate-400 font-semibold text-sm px-5 py-3 rounded-xl transition-all">
              Ver Todos os Tickets
            </a>
          </nav>
        </div>
      </aside>

      {/* 2. Área Principal - Foco Total na Gestão de Tickets */}
      <main className="flex-1 flex flex-col gap-8">
        
        {/* Título Profissional e Limpo */}
        <div className="mb-2">
          <h1 className="text-4xl font-extrabold text-slate-950 tracking-tighter">Visão Geral da Triagem</h1>
          <p className="text-slate-600 mt-2 font-medium">Monitoramento em tempo real do motor de IA classificando incidentes do ERP.</p>
        </div>

        {/* 3. Grid Bento de Métricas (KPIs) - Arejado e Profissional */}
        <div className="grid grid-cols-3 gap-8 mb-4">
          <div className="metric-card bg-white rounded-[24px] p-8 border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-sky-600"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tickets Ingeridos (Hoje)</p>
            <p className="text-5xl font-extrabold text-slate-950 mt-3 tracking-tight">{mockMetrics.total}</p>
          </div>
          
          <div className="metric-card bg-white rounded-[24px] p-8 border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bugs Críticos</p>
            <p className="text-5xl font-extrabold text-rose-600 mt-3 tracking-tight">{mockMetrics.criticos}</p>
          </div>

          <div className="metric-card bg-white rounded-[24px] p-8 border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acurácia NLP</p>
            <p className="text-5xl font-extrabold text-emerald-600 mt-3 tracking-tight">{mockMetrics.accuracy}%</p>
          </div>
        </div>

        {/* 4. Grid de Tabelas (Fila Prioritária + Todos os Tickets) */}
        <BentoCard title={<><span className="text-rose-500">🔴</span> Fila Prioritária (Alta Urgência)</>}>
          <TicketTable tickets={mockUrgentes} />
        </BentoCard>

        <BentoCard title={<><span className="text-slate-500">📋</span> Todos os Tickets Recentes</>}>
          <TicketTable tickets={mockTodos} />
        </BentoCard>

        {/* 5. Ações Rápidas */}
        <div className="mt-4">
          <BentoCard title={<><span className="text-emerald-500">⚡</span> Ações Rápidas</>}>
            <div className="flex gap-4">
              <button className="flex-1 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm py-4 px-6 rounded-2xl transition-all shadow-md hover:-translate-y-0.5">
                Forçar Varredura ERP
              </button>
              <button className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-sm py-4 px-6 rounded-2xl transition-all">
                Ajustar Pesos NLP
              </button>
              <button className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-sm py-4 px-6 rounded-2xl transition-all">
                Exportar Relatório
              </button>
            </div>
          </BentoCard>
        </div>

      </main>
    </div>
  );
}