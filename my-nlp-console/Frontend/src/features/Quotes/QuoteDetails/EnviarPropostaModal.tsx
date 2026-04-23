import React, { useState } from 'react';
import { X, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import type { IQuote } from '../types';
import { api } from '../../../services/api'; 

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
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6 font-sans animate-in fade-in duration-200 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loadingWhatsApp && !loadingEmail && onClose()}
    >
      {/* Container principal usando classes do seu sistema de temas */}
      <div className="bg-theme-panel border border-theme-border rounded-shape-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden zoom-in-95 animate-in transition-colors">
        
        {/* Header - Padrão do sistema */}
        <div className="px-6 py-4 border-b border-theme-border bg-theme-panel flex justify-between items-center shrink-0 transition-colors">
          <div>
            <h2 className="text-lg font-semibold text-theme-text leading-none transition-colors">
              Enviar Proposta
            </h2>
            <p className="text-sm text-theme-muted mt-1.5 transition-colors uppercase tracking-wider font-semibold">
              Orçamento #{String(quote.id).padStart(4, '0')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-theme-muted hover:text-rose-500 hover:bg-theme-base rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-theme-panel transition-colors custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coluna WhatsApp */}
          <div className="flex flex-col gap-4 lg:border-r lg:border-theme-border lg:pr-8 transition-colors">
            <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-tight mb-2 border-b border-theme-border pb-2 transition-colors">
              <MessageCircle size={18} />
              <h3>Via WhatsApp</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">
                Número do Cliente
              </label>
              <input 
                type="text" 
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">
                Mensagem
              </label>
              <textarea 
                value={textoWhats}
                onChange={(e) => setTextoWhats(e.target.value)}
                className="w-full flex-1 min-h-55 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent transition-all resize-none custom-scrollbar"
              />
            </div>

            <button 
              onClick={handleEnviarWhatsApp}
              disabled={loadingWhatsApp || !telefone}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
              {loadingWhatsApp ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
              Abrir WhatsApp Web
            </button>
          </div>

          {/* Coluna E-mail */}
          <div className="flex flex-col gap-4 lg:pl-2">
            <div className="flex items-center gap-2 text-blue-500 font-bold tracking-tight mb-2 border-b border-theme-border pb-2 transition-colors">
              <Mail size={18} />
              <h3>Via E-mail</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">
                E-mail do Cliente
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@empresa.com.br"
                className="w-full bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-theme-text mb-1 transition-colors">
                Corpo do E-mail
              </label>
              <textarea 
                value={textoEmail}
                onChange={(e) => setTextoEmail(e.target.value)}
                className="w-full flex-1 min-h-55 bg-theme-base border border-theme-border text-theme-text placeholder:text-theme-muted rounded-md px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-theme-accent focus:border-theme-accent transition-all resize-none custom-scrollbar"
              />
            </div>

            <button 
              onClick={handleEnviarEmail}
              disabled={loadingEmail || !email}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-md font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
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