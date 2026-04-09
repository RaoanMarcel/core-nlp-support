import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom'; // <-- Novo import!

// (Mantenha os Mocks iguais aos anteriores)
const mockMetrics = { total: 142, criticos: 5, accuracy: 96.4 };
const mockAnomaly = { active: true, title: "Pico de Reclamações", message: "A IA detectou 42 tickets relacionados a 'Falha no Checkout'.", type: "warning" };
const mockChartData = [
  { name: 'Dúvidas/Uso', value: 54, color: '#3b82f6' },
  { name: 'Bugs Críticos', value: 18, color: '#f43f5e' },
  { name: 'Performance', value: 25, color: '#f59e0b' },
  { name: 'Autenticação', value: 27, color: '#8b5cf6' },
];
const mockHealth = { status: 'Online', inferenceTime: '45ms', uptime: '99.9%', lastTraining: 'Há 2 horas' };
const mockTopCritical = [
  { id: '#1042', assunto: 'Falha fatal no Checkout (Pix)', severidade: 'SLA Rompido', responsavel: 'Carlos E.', tempoAberto: '4h 15m' },
  { id: '#1089', assunto: 'Lentidão severa na API de Relatórios', severidade: 'Crítico', responsavel: 'Ana S.', tempoAberto: '1h 45m' },
  { id: '#1095', assunto: 'Erro 500 no Gateway de Pagamento', severidade: 'Crítico', responsavel: 'Carlos E.', tempoAberto: '50m' },
];

function SeverityBadge({ type }: { type: string }) {
  if (type === 'SLA Rompido') return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-600 text-white animate-pulse">{type}</span>;
  if (type === 'Crítico') return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-700">{type}</span>;
  return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">{type}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate(); // <-- Hook de navegação do React Router

  // Removemos a div externa com a Sidebar velha. 
  // Agora retornamos direto a <main> que se encaixa no novo Layout.
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9f9]">
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

      <div className="p-8 flex flex-col gap-5 h-full overflow-y-auto">
        <div className="grid grid-cols-3 gap-5 shrink-0">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tickets (Hoje)</span>
            <span className="text-3xl font-black text-slate-900">{mockMetrics.total}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider pl-1">Atenção Necessária</span>
            <span className="text-3xl font-black text-rose-600 pl-1">{mockMetrics.criticos}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider pl-1">Acurácia NLP</span>
            <span className="text-3xl font-black text-emerald-600 pl-1">{mockMetrics.accuracy}%</span>
          </div>
        </div>

        {mockAnomaly.active && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 shadow-sm shrink-0">
            <div className="bg-amber-100 p-2 rounded-full">
              <span className="text-amber-600 text-lg">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">{mockAnomaly.title}</h3>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">{mockAnomaly.message}</p>
            </div>
            <button className="bg-amber-200/50 hover:bg-amber-200 text-amber-900 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              Investigar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 min-h-[380px]">
          <div className="lg:col-span-3 flex flex-col gap-5 justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Distribuição de Triagem (IA)</h3>
              <div className="flex items-center gap-8 mt-2">
                <div className="w-[180px] h-[180px] shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockChartData} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {mockChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {mockChartData.map(item => (
                    <div key={item.name} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                        <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Motor Core NLP</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Status: <span className="text-emerald-600 font-bold">{mockHealth.status}</span></p>
                </div>
              </div>
              <div className="flex gap-8 text-right">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inferência</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{mockHealth.inferenceTime}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Último Treino</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{mockHealth.lastTraining}</p>
                </div>
              </div>
            </div>
            <div className="flex-1"></div>
          </div>

          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-sm font-bold text-slate-800">Top Críticos</h3>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded uppercase">SLA em risco</span>
              </div>
              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1">
                {mockTopCritical.map(ticket => (
                  <div key={ticket.id} className="group p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer bg-slate-50/30 hover:bg-white flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-400 group-hover:text-sky-600 transition-colors">{ticket.id}</span>
                      <SeverityBadge type={ticket.severidade} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{ticket.assunto}</p>
                    <div className="flex justify-between items-center mt-1 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">{ticket.responsavel.charAt(0)}</div>
                        <span className="text-[10px] font-medium text-slate-500">{ticket.responsavel}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">⏱️ {ticket.tempoAberto}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* O BOTÃO AGORA REDIRECIONA PARA /FILA */}
              <button 
                onClick={() => navigate('/fila')} 
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Ver Fila Completa &rarr;
              </button>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}