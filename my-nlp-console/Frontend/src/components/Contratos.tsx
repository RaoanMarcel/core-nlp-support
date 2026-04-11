import React, { useState, useEffect } from 'react';
import ProspectModal from './ContratosModal';

// Tipagem baseada no Prisma
export interface Prospect {
  id: string;
  cnpj: string;
  nome: string;
  modulosAtuais: string;
  telefone: string;
  status: 'PENDENTE' | 'EM_ATENDIMENTO' | 'APROVADO' | 'REPROVADO';
}

export default function ProspectList() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUserId = "user-123"; // Simulação do usuário logado

  // Simulação de Fetch inicial
  useEffect(() => {
    // Aqui você faria um fetch na sua API (GET /prospects)
    setProspects([
      { id: '1', cnpj: '00.000.000/0001-01', nome: 'Empresa Alpha', modulosAtuais: 'NFE', telefone: '11999999999', status: 'PENDENTE' },
      { id: '2', cnpj: '11.111.111/0001-11', nome: 'Bazar Beta', modulosAtuais: 'Nenhuma', telefone: '11888888888', status: 'EM_ATENDIMENTO' },
    ]);

    // DICA: Aqui você configuraria o Socket.io para escutar mudanças e atualizar a lista
    // socket.on('prospect-locked', (data) => atualizaStatusNaLista(data.id, data.status));
  }, []);

  const handleRowClick = async (prospect: Prospect) => {
    if (prospect.status !== 'PENDENTE') {
      alert('Este cliente não pode ser acessado no momento (já está em atendimento ou finalizado).');
      return;
    }

    try {
      const response = await fetch(`/api/prospects/${prospect.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (!response.ok) {
        throw new Error('Cliente já assumido por outro usuário.');
      }

      // Se deu certo, atualiza a lista localmente e abre o modal
      setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, status: 'EM_ATENDIMENTO' } : p));
      setSelectedProspect(prospect);
      setIsModalOpen(true);
      
    } catch (error: any) {
      alert(error.message);
      // Aqui seria ideal dar um refetch na lista para atualizar a UI do usuário que perdeu a corrida
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProspect(null);
    // Ideal: dar um refetch na lista aqui para pegar os status atualizados
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Fila de Prospecção</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
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
                className={`border-b cursor-pointer transition-colors
                  ${prospect.status === 'EM_ATENDIMENTO' ? 'bg-yellow-100 cursor-not-allowed hover:bg-yellow-200' : ''}
                  ${prospect.status === 'PENDENTE' ? 'hover:bg-blue-50' : ''}
                  ${prospect.status === 'APROVADO' ? 'bg-green-50' : ''}
                  ${prospect.status === 'REPROVADO' ? 'bg-red-50' : ''}
                `}
              >
                <td className="p-4 text-gray-700">{prospect.cnpj}</td>
                <td className="p-4 font-medium text-gray-900">{prospect.nome}</td>
                <td className="p-4 text-gray-600">{prospect.modulosAtuais}</td>
                <td className="p-4 text-gray-600">{prospect.telefone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold
                    ${prospect.status === 'PENDENTE' ? 'bg-gray-200 text-gray-700' : ''}
                    ${prospect.status === 'EM_ATENDIMENTO' ? 'bg-yellow-300 text-yellow-800' : ''}
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
          onClose={handleCloseModal} 
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}