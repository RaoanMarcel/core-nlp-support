import React, { useState } from 'react';
import { type Prospect } from './Contratos';

const MODULOS_DISPONIVEIS = ['NFE', 'NFCE', 'MDFE', 'CTE', 'NFSE'];

interface ModalProps {
  prospect: Prospect;
  onClose: () => void;
  currentUserId: string;
}

export default function ProspectModal({ prospect, onClose, currentUserId }: ModalProps) {
  const [observacoes, setObservacoes] = useState('');
  const [modulosSelecionados, setModulosSelecionados] = useState<string[]>([]);

  const handleCheck = (modulo: string) => {
    setModulosSelecionados(prev => 
      prev.includes(modulo) 
        ? prev.filter(m => m !== modulo) 
        : [...prev, modulo]
    );
  };

  const handleSubmit = async (acao: 'APROVADO' | 'REPROVADO') => {
    try {
      const response = await fetch(`/api/prospects/${prospect.id}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          observacoes,
          novosModulos: modulosSelecionados,
          acao
        })
      });

      if (response.ok) {
        onClose(); // Fecha modal e idealmente atualiza a tabela pai
      } else {
        alert('Erro ao processar atendimento.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Atendimento: {prospect.nome}</h2>
          <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded font-bold animate-pulse">EM ATENDIMENTO</span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="text-gray-500 block">CNPJ</span><strong className="text-gray-800">{prospect.cnpj}</strong></div>
            <div><span className="text-gray-500 block">Telefone</span><strong className="text-gray-800">{prospect.telefone}</strong></div>
            <div className="col-span-2"><span className="text-gray-500 block">Módulos Atuais</span><strong className="text-gray-800">{prospect.modulosAtuais}</strong></div>
          </div>

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observações da Prospecção</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Digite como foi a conversa..."
            />
          </div>

          {/* Módulos */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Novos Módulos de Interesse</label>
            <div className="flex flex-wrap gap-3">
              {MODULOS_DISPONIVEIS.map(modulo => (
                <label key={modulo} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    checked={modulosSelecionados.includes(modulo)}
                    onChange={() => handleCheck(modulo)}
                  />
                  <span className="text-sm font-medium text-gray-700">{modulo}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={() => handleSubmit('REPROVADO')}
            className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
          >
            Reprovar
          </button>
          <button 
            onClick={() => handleSubmit('APROVADO')}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Aprovar Venda
          </button>
        </div>
        
      </div>
    </div>
  );
}