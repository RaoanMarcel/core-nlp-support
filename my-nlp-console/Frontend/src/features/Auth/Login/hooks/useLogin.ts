import { useState } from 'react';
import { authService } from '../../../../services/auth.service';
import type { LoginProps } from '../../../../types/auth.types';

export function useLogin({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [modoTrocaSenha, setModoTrocaSenha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearError = () => {
    if (erro) setErro('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErro('');

    try {
      const data = await authService.login(usuario, senha);

      if (data.token && data.user) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      }
    } catch (error: any) {
      // O Axios lança erro para status 400+. Capturamos o 403 aqui.
      const status = error.response?.status;
      const responseData = error.response?.data;

      if (status === 403 && responseData?.requirePasswordChange) {
        setModoTrocaSenha(true);
      } else {
        setErro(responseData?.error || 'Credenciais inválidas ou erro no servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não conferem!');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErro('');

    try {
      const data = await authService.trocarSenhaPrimeiroAcesso(usuario, senha, novaSenha);
      
      if (data.token && data.user) {
        localStorage.setItem('@CRM:token', data.token);
        localStorage.setItem('@CRM:user', JSON.stringify(data.user));
        onLoginSuccess(data.token, data.user);
      }
    } catch (error: any) {
      setErro(error.response?.data?.error || 'Erro na comunicação com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarTrocaSenha = () => {
    setModoTrocaSenha(false);
    setNovaSenha('');
    setConfirmarSenha('');
    setErro('');
  };

  return {
    usuario, setUsuario,
    senha, setSenha,
    novaSenha, setNovaSenha,
    confirmarSenha, setConfirmarSenha,
    isLoading,
    erro, setErro,
    modoTrocaSenha,
    showPassword, setShowPassword,
    clearError,
    handleLogin,
    handleTrocarSenha,
    cancelarTrocaSenha
  };
}