import React, { useState } from 'react';
import { X, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import type { IQuote } from '../types';
import { api } from '../../../services/api'; // Confirme se o caminho da API está correto no seu projeto

// AQUI ESTÁ A CORREÇÃO: Agora o modal aceita a propriedade "quote"
interface EnviarPropostaModalProps {
  quote: IQuote;
  usuarioAtual: { id: string; nome: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnviarPropostaModal({ quote, usuarioAtual, onClose, onSuccess }: EnviarPropostaModalProps) {
  
  const [telefone, setTelefone] = useState(quote.telefonePrincipal || '');
  const [email, setEmail] = useState(quote.email || '');
  
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.valorNegociado || quote.valorBase || 0);
  
  const templateInicial = `Olá, ${quote.nomeCliente}!\n\nConforme conversamos, segue nossa proposta detalhada:\n\nPlano: ${quote.plano}\nMódulos: ${quote.modulos.join(', ')}\nValor Mensal: ${valorFormatado}\n\nFico à disposição para tirarmos qualquer dúvida.\n\nAbraço,\n${usuarioAtual.nome}`;

  const [textoWhats, setTextoWhats] = useState(templateInicial);
  const [textoEmail, setTextoEmail] = useState(templateInicial);

  const handleEnviarWhatsApp = async () => {
    setLoadingWhatsApp(true);
    
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    const linkWhats = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(textoWhats)}`;
    
    window.open(linkWhats, '_blank');

    try {
      await api.post(`/quotes/${quote.id}/enviar-whats`, {
        usuario: usuarioAtual.nome,
        textoEnviado: textoWhats
      });
      onSuccess();
    } catch (err) {
      console.error("Erro ao registrar log do WhatsApp", err);
      onClose();
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!email.trim()) {
      alert("Por favor, preencha o e-mail do cliente.");
      return;
    }

    setLoadingEmail(true);
    try {
      await api.post(`/quotes/${quote.id}/enviar-email`, {
        emailDestino: email,
        texto: textoEmail,
        usuarioNome: usuarioAtual.nome
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao disparar o e-mail. Verifique o console.');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden zoom-in-95 animate-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Enviar Proposta</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Pedido #{String(quote.id).padStart(4, '0')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body (Grid dividido em Whats e Email) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar">
          
          {/* Coluna WhatsApp */}
          <div className="flex flex-col gap-4 lg:border-r lg:border-slate-100 lg:pr-8">
            <div className="flex items-center gap-2 text-emerald-600 font-black tracking-tight mb-2">
              <MessageCircle size={20} />
              <h3>Via WhatsApp</h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Número do Cliente</label>
              <input 
                type="text" 
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mensagem</label>
              <textarea 
                value={textoWhats}
                onChange={(e) => setTextoWhats(e.target.value)}
                className="w-full flex-1 min-h-[220px] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none custom-scrollbar"
              />
            </div>

            <button 
              onClick={handleEnviarWhatsApp}
              disabled={loadingWhatsApp || !telefone}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            >
              {loadingWhatsApp ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
              Abrir WhatsApp Web
            </button>
          </div>

          {/* Coluna E-mail */}
          <div className="flex flex-col gap-4 lg:pl-2">
            <div className="flex items-center gap-2 text-blue-600 font-black tracking-tight mb-2">
              <Mail size={20} />
              <h3>Via E-mail</h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail do Cliente</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@empresa.com.br"
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Corpo do E-mail</label>
              <textarea 
                value={textoEmail}
                onChange={(e) => setTextoEmail(e.target.value)}
                className="w-full flex-1 min-h-[220px] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none custom-scrollbar"
              />
            </div>

            <button 
              onClick={handleEnviarEmail}
              disabled={loadingEmail || !email}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            >
              {loadingEmail ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loadingEmail ? 'Enviando...' : 'Disparar E-mail'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}