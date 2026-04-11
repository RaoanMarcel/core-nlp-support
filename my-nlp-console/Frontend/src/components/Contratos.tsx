import React, { useState, useEffect, useRef } from 'react';
import ProspectModal from './ContratosModal';
import Papa from 'papaparse';
import { UploadCloud } from 'lucide-react';

export interface Prospect {
  id: string;
  cnpj: string;
  nome: string;
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO';
}

// ⚠️ ATENÇÃO: Confirme se a sua rota base no backend é essa mesma (pode ser /contratos ou /prospects)
const API_URL = 'http://localhost:3000/prospects'; 

export default function ProspectList() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = "user-123"; 

  // ==========================================
  // BUSCAR DO BANCO DE DADOS
  // ==========================================
  const fetchProspects = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setProspects(data);
    } catch (error) {
      console.error('Erro ao carregar prospects:', error);
      alert('Erro ao carregar a lista do banco de dados.');
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // ==========================================
  // IMPORTAR CSV (ENVIANDO PRO BACKEND)
  // ==========================================
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      
      const lines = text.split('\n');
      if (lines[0].includes('Estabelecimentos')) {
        lines.shift(); 
      }
      const cleanCsv = lines.join('\n');

      Papa.parse(cleanCsv, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const clientesParseados = results.data;

          const novosProspects = clientesParseados
            .filter((c: any) => c.CNPJ) 
            .map((c: any) => ({
              cnpj: String(c.CNPJ),
              nome: String(c['Razão Social'] || c['Nome Fantasia'] || 'Sem Nome'),
              telefone: String(c['Telefone Principal'] || 'Sem Telefone'),
              modulosAtuais: 'Nenhum',
              // O status PENDENTE é definido lá no backend, mas podemos mandar limpo
            }));

          try {
            // Mandando a lista pro Backend!
            const response = await fetch(`${API_URL}/importar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prospects: novosProspects })
            });

            if (!response.ok) throw new Error('Erro ao salvar no banco');
            
            const resultData = await response.json();
            alert(resultData.message || 'Importação concluída!');
            
            // Recarrega a tabela para trazer os clientes com os IDs reais do banco
            await fetchProspects();

          } catch (apiError) {
            console.error('Erro na API de importação:', apiError);
            alert('Falha ao enviar os dados para o servidor.');
          } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }
      });
    } catch (error) {
      console.error(error);
      alert('Falha ao processar o arquivo CSV.');
      setIsImporting(false);
    }
  };

  // ==========================================
  // TRAVAR CLIENTE NO BANCO AO CLICAR
  // ==========================================
  const handleRowClick = async (prospect: Prospect) => {
    if (prospect.status !== 'PENDENTE') {
      alert('Este cliente não pode ser acessado no momento.');
      return;
    }

    try {
      // Bate na rota de travar do backend
      const response = await fetch(`${API_URL}/${prospect.id}/travar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (response.status === 409) {
        alert('Este cliente acabou de ser pego por outro operador!');
        fetchProspects(); // Recarrega para mostrar que está ocupado
        return;
      }

      if (!response.ok) throw new Error('Erro ao travar cliente');

      const updatedProspect = await response.json();

      // Atualiza a tabela local e abre o modal
      setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, status: 'EM_ATENDIMENTO' } : p));
      setSelectedProspect(updatedProspect);
      setIsModalOpen(true);

    } catch (error) {
      console.error('Erro ao travar:', error);
      alert('Não foi possível iniciar o atendimento.');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fila de Prospecção</h1>
        
        <div>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <UploadCloud size={20} />
            {isImporting ? 'Enviando...' : 'Importar CSV'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase border-b border-slate-200">
              <th className="p-4 font-semibold">CNPJ</th>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Módulos Atuais</th>
              <th className="p-4 font-semibold">Telefone</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {prospects.map((prospect) => (
              <tr 
                key={prospect.id} 
                onClick={() => handleRowClick(prospect)}
                className={`border-b border-slate-100 cursor-pointer transition-colors
                  ${prospect.status === 'EM_ATENDIMENTO' ? 'bg-yellow-50 cursor-not-allowed hover:bg-yellow-100' : ''}
                  ${prospect.status === 'PENDENTE' ? 'hover:bg-slate-50' : ''}
                `}
              >
                <td className="p-4 text-slate-700">{prospect.cnpj}</td>
                <td className="p-4 font-medium text-slate-900">{prospect.nome}</td>
                <td className="p-4 text-slate-600">{prospect.modulosAtuais}</td>
                <td className="p-4 text-slate-600">{prospect.telefone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                    ${prospect.status === 'PENDENTE' ? 'bg-slate-200 text-slate-600' : 'bg-yellow-200 text-yellow-800'}
                  `}>
                    {prospect.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedProspect && (
        <ProspectModal 
          prospect={selectedProspect} 
          onClose={() => {
            setIsModalOpen(false);
            fetchProspects(); // Recarrega a tabela caso o status tenha mudado no Modal
          }} 
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}