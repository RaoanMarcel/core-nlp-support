import React, { useState, useEffect } from 'react';
import { 
  Calendar, Zap, BarChart2, Bot, Download, 
  LayoutDashboard, TableProperties, Info, FileSpreadsheet,
  Loader2, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

const getFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; 
};

const getInitialDates = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  return {
    start: getFormattedDate(oneMonthAgo),
    end: getFormattedDate(today)
  };
};

const REPORT_MODULES = {
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
type ModuleKey = keyof typeof REPORT_MODULES;

const ITEMS_PER_PAGE = 15;

export default function Relatorios() {

  const [selectedModule, setSelectedModule] = useState<ModuleKey>('prospects');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const initialDates = getInitialDates();
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);

  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reportData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = reportData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setSelectedDimensions([]);
    setSelectedMetrics([]);
    setReportData([]);
    setHasPreview(false);
    setCurrentPage(1); 
  }, [selectedModule]);

  const toggleDimension = (id: string) => {
    setSelectedDimensions(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const moduleConfig = REPORT_MODULES[selectedModule];
  const canGenerate = selectedDimensions.length > 0 && selectedMetrics.length > 0;

  // --- FUNÇÃO PARA SELECIONAR TODOS ---
  const handleToggleAllDimensions = () => {
    const allDimIds = moduleConfig.dimensions.map(d => d.id);
    if (selectedDimensions.length === allDimIds.length) {
      setSelectedDimensions([]); // Desmarcar todos
    } else {
      setSelectedDimensions(allDimIds); // Marcar todos
    }
  };

  const handleGerarPrevia = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    
    try {
      const payload = {
        modulo: selectedModule,
        dataInicial: startDate,
        dataFinal: endDate,
        dimensoes: selectedDimensions,
        metrics: selectedMetrics 
      };

      // Adeus axios manual, adeus pegar token na mão! 
      // O nosso api.ts faz tudo isso por baixo dos panos.
      const response = await api.post('/relatorios/build', payload);

      setReportData(response.data);
      setCurrentPage(1); 
      setHasPreview(true);

    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('@CRM:token');
        localStorage.removeItem('@CRM:user');
        window.location.reload();
        return;
      }
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXLSX = () => {
    if (reportData.length === 0) return;

    const selectedKeys = [...selectedDimensions, ...selectedMetrics];
    
    const headerLabels = selectedKeys.map(key => {
      const dim = moduleConfig.dimensions.find(d => d.id === key);
      const met = moduleConfig.metrics.find(m => m.id === key);
      return dim?.label || met?.label || key;
    });

    const dataRows = reportData.map(row => {
      return selectedKeys.map(key => {
        return row[key] !== null && row[key] !== undefined ? row[key] : '';
      });
    });

    const worksheetData = [headerLabels, ...dataRows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    const dataBR = startDate.split('-').reverse().join('-');
    XLSX.writeFile(workbook, `exportacao_${selectedModule}_${dataBR}.xlsx`);
  };

  return (
    <div className="flex-1 h-full bg-[#f8f9f9] overflow-y-auto p-4 md:p-8 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios e Exportação</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Construa visualizações personalizadas cruzando os dados da operação.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <LayoutDashboard size={16} /> Construtor
        </h2>
        
        <div className="bg-white border border-[#d8dcde] rounded-xl shadow-sm flex flex-col md:flex-row min-h-125 overflow-hidden">
          
          <div className="w-full md:w-[320px] bg-[#fafafa] border-r border-[#d8dcde] p-6 flex flex-col shrink-0 h-150 overflow-y-auto">
            
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-900 block mb-2">Base de Dados</label>
              <select 
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value as ModuleKey)}
                className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {Object.entries(REPORT_MODULES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <hr className="border-[#d8dcde] mb-6" />

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Período <span className="text-[10px] font-normal text-slate-500">(Filtro)</span></h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Inicial</label>
                  <input 
                    type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Final</label>
                  <input 
                    type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#d8dcde] mb-6" />

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Agrupar por <span className="text-[10px] font-normal text-slate-500">(Dimensões)</span></h3>
                {/* BOTÃO DE SELECIONAR TODOS */}
                <button 
                  onClick={handleToggleAllDimensions}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                >
                  {selectedDimensions.length === moduleConfig.dimensions.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
              </div>
              <div className="space-y-2.5">
                {moduleConfig.dimensions.map(dim => (
                  <label key={dim.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" checked={selectedDimensions.includes(dim.id)} onChange={() => toggleDimension(dim.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 transition-all shrink-0"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">{dim.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Calcular <span className="text-[10px] font-normal text-slate-500">(Métricas)</span></h3>
              <div className="space-y-2.5">
                {moduleConfig.metrics.map(metric => (
                  <label key={metric.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" checked={selectedMetrics.includes(metric.id)} onChange={() => toggleMetric(metric.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 transition-all shrink-0"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGerarPrevia}
              disabled={!canGenerate || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Play size={16} fill="currentColor"/> Gerar Prévia</>}
            </button>
          </div>

          {/* COLUNA DIREITA: O RESULTADO REAL */}
          <div className="flex-1 p-6 flex flex-col bg-white overflow-hidden">
            {!hasPreview ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                  <TableProperties size={32} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Área de Visualização</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Selecione os campos na barra lateral e clique em <strong>Gerar Prévia</strong>.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Resultado da Consulta</h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Mostrando {reportData.length} linhas totais agrupadas.
                    </p>
                  </div>
                  <button 
                    onClick={handleDownloadXLSX}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-blue-200/50"
                  >
                    <Download size={14} /> Baixar XLSX Completo
                  </button>
                </div>
                
                {/* Tabela */}
                <div className="overflow-auto flex-1 border border-[#d8dcde] rounded-t-lg">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-[#d8dcde]">
                        {selectedDimensions.map(d => (
                          <th key={d} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0">
                            {moduleConfig.dimensions.find(x => x.id === d)?.label}
                          </th>
                        ))}
                        {selectedMetrics.map(m => (
                          <th key={m} className="py-2.5 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-[#d8dcde] last:border-r-0 text-right bg-blue-50/30">
                            {moduleConfig.metrics.find(x => x.id === m)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8dcde]">
                      {paginatedData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          {selectedDimensions.map(d => (
                            <td key={`dim-${d}`} className="py-3 px-4 text-sm text-slate-700 border-r border-[#d8dcde] last:border-r-0">
                              {row[d]}
                            </td>
                          ))}
                          {selectedMetrics.map(m => (
                            <td key={`met-${m}`} className="py-3 px-4 text-sm font-bold text-slate-900 border-r border-[#d8dcde] last:border-r-0 text-right">
                              {row[m]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {reportData.length === 0 && (
                        <tr>
                          <td colSpan={selectedDimensions.length + selectedMetrics.length} className="py-8 text-center text-sm text-slate-500">
                            Nenhum dado encontrado para este período e filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* CONTROLES DE PAGINAÇÃO */}
                {reportData.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border border-t-0 border-[#d8dcde] bg-slate-50 rounded-b-lg">
                    <div className="text-xs text-slate-500">
                      Mostrando <span className="font-bold text-slate-700">{startIndex + 1}</span> até <span className="font-bold text-slate-700">{Math.min(startIndex + ITEMS_PER_PAGE, reportData.length)}</span> de <span className="font-bold text-slate-700">{reportData.length}</span> resultados
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md border border-[#d8dcde] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Página Anterior"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-medium text-slate-600 px-2">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 rounded-md border border-[#d8dcde] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Próxima Página"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SESSÃO 3: EXPORTAÇÃO DE DADOS */}
      <div>
        <div className="bg-white border-2 border-emerald-600/20 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group hover:border-emerald-600/40 transition-colors">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="flex gap-4 items-start z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-1">Exportar Logs para Retreinamento da IA</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Baixe o histórico bruto de tickets corrigidos pelos humanos. Este dataset já vem higienizado e formatado para realizar o fine-tuning do seu modelo offline.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm z-10">
            <Download size={18} /> Exportar Base de Treinamento (.xlsx)
          </button>
        </div>
      </div>

    </div>
  );
}