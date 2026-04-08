import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// MOCKS REALISTAS PARA O BRIEFING MATINAL
// ==========================================
const mockMetrics = { total: 142, criticos: 5, accuracy: 96.4 };

const mockAnomaly = {
  active: true,
  title: "Pico de Reclamações",
  message: "A IA detectou 42 tickets relacionados a 'Falha no Checkout' nos últimos 30 minutos.",
  type: "warning"
};

const mockChartData = [
  { name: 'Dúvidas/Uso', value: 54, color: '#3b82f6' },      // blue-500
  { name: 'Bugs Críticos', value: 18, color: '#f43f5e' },    // rose-500
  { name: 'Performance', value: 25, color: '#f59e0b' },      // amber-500
  { name: 'Autenticação', value: 27, color: '#8b5cf6' },     // violet-500
];

const mockHealth = {
  status: 'Online',
  inferenceTime: '45ms',
  uptime: '99.9%',
  lastTraining: 'Há 2 horas'
};

const mockTopCritical = [
  { id: '#1042', assunto: 'Falha fatal no Checkout (Pix)', severidade: 'SLA Rompido', responsavel: 'Carlos E.', tempoAberto: '4h 15m' },
  { id: '#1089', assunto: 'Lentidão severa na API de Relatórios', severidade: 'Crítico', responsavel: 'Ana S.', tempoAberto: '1h 45m' },
  { id: '#1095', assunto: 'Erro 500 no Gateway de Pagamento', severidade: 'Crítico', responsavel: 'Carlos E.', tempoAberto: '50m' },
  { id: '#1102', assunto: 'Perda de sessão ao trocar de aba', severidade: 'Atenção', responsavel: 'João P.', tempoAberto: '35m' },
  { id: '#1110', assunto: 'Falha de Autenticação SSO (Azure)', severidade: 'Atenção', responsavel: 'Não atribuído', tempoAberto: '12m' },
];

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function SeverityBadge({ type }: { type: string }) {
  if (type === 'SLA Rompido') return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-600 text-white animate-pulse">{type}</span>;
  if (type === 'Crítico') return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-700">{type}</span>;
  return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">{type}</span>;
}

// ==========================================
// COMPONENTE PRINCIPAL (DASHBOARD)
// ==========================================
export default function Dashboard() {
  return (
    <div className="flex w-full h-full">
      
      {/* 1. Sidebar Compacta (Mantida Intacta) */}
      <aside className="w-56 bg-slate-950 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-extrabold text-lg tracking-tight">Core NLP</h2>
        </div>
        <nav className="p-2 flex flex-col gap-1 flex-1 mt-2">
          <a href="#" className="bg-slate-800/50 text-emerald-400 font-semibold text-sm px-3 py-2.5 rounded-lg transition-colors">Briefing Gerencial</a>
          <a href="#" className="hover:bg-slate-800 text-slate-400 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors">Fila de Tickets</a>
          <a href="#" className="hover:bg-slate-800 text-slate-400 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors">Saúde da IA</a>
        </nav>
      </aside>

      {/* 2. Área Principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9f9]">
        
        {/* Cabeçalho */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bom dia, Gestor.</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Aqui está o resumo da triagem de IA de hoje.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm">
              Ajustar Motor NLP
            </button>
          </div>
        </header>

        {/* Área de Conteúdo Scrolável */}
        <div className="p-8 flex flex-col gap-6 h-full overflow-y-auto">
          
          {/* Métricas do Topo */}
          <div className="grid grid-cols-3 gap-6 shrink-0">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets (Hoje)</span>
              <span className="text-3xl font-black text-slate-900">{mockMetrics.total}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider pl-2">Atenção Necessária</span>
              <span className="text-3xl font-black text-rose-600 pl-2">{mockMetrics.criticos}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider pl-2">Acurácia NLP</span>
              <span className="text-3xl font-black text-emerald-600 pl-2">{mockMetrics.accuracy}%</span>
            </div>
          </div>

          {/* Banner de Anomalia */}
          {mockAnomaly.active && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm shrink-0">
              <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                <span className="text-amber-600 text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">{mockAnomaly.title}</h3>
                <p className="text-sm text-amber-800 mt-1 font-medium">{mockAnomaly.message}</p>
              </div>
              <button className="ml-auto bg-amber-200/50 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                Investigar
              </button>
            </div>
          )}

          {/* Layout Principal: 2 Colunas (60% / 40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-[400px]">
            
            {/* COLUNA ESQUERDA (Visão Geral - Ocupa 3/5 do grid) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Gráfico de Rosca */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Distribuição de Triagem (IA)</h3>
                <div className="flex-1 min-h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockChartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {mockChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legenda Customizada */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-3">
                    {mockChartData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                        <span className="text-xs font-bold text-slate-900 ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Saúde do Motor NLP */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Motor Core NLP</h4>
                    <p className="text-xs font-medium text-slate-500">Status: <span className="text-emerald-600 font-bold">{mockHealth.status}</span></p>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo de Inferência</p>
                    <p className="text-sm font-bold text-slate-800">{mockHealth.inferenceTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Treino</p>
                    <p className="text-sm font-bold text-slate-800">{mockHealth.lastTraining}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA (Ação Imediata - Ocupa 2/5 do grid) */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                
                <div className="flex justify-between items-center mb-5 shrink-0">
                  <h3 className="text-sm font-bold text-slate-800">Top 5 Críticos</h3>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md uppercase">SLA em risco</span>
                </div>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                  {mockTopCritical.map(ticket => (
                    <div key={ticket.id} className="group p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-sky-600">{ticket.id}</span>
                        <SeverityBadge type={ticket.severidade} />
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-sky-700 transition-colors">
                        {ticket.assunto}
                      </p>
                      
                      <div className="flex justify-between items-center mt-1 pt-3 border-t border-slate-100/80">
                        <div className="flex items-center gap-1.5">
                          {ticket.responsavel === 'Não atribuído' ? (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded">Livre</span>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                {ticket.responsavel.charAt(0)}
                              </div>
                              <span className="text-[11px] font-medium text-slate-500">{ticket.responsavel}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          ⏱️ {ticket.tempoAberto}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm">
                  Ver Fila Completa &rarr;
                </button>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}