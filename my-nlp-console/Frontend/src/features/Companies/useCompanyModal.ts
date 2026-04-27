// Frontend/src/features/Companies/useCompanyModal.ts
import { useState, useEffect } from 'react';
import { companyService } from '../../services/company.service';
import type { ICompany, ICompanyDTO } from '../../types/company.types';
import { useToast } from '../../contexts/ToastContext';

export function useCompanyModal(
  companyEditando: ICompany | null,
  onClose: () => void,
  onRefresh: () => void
) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [formData, setFormData] = useState<ICompanyDTO>({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    email: '',
    telefonePrincipal: '',
    telefoneSecundario: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
  });

  useEffect(() => {
    if (companyEditando) {
      setFormData({
        cnpj: companyEditando.cnpj || '',
        razaoSocial: companyEditando.razaoSocial || '',
        nomeFantasia: companyEditando.nomeFantasia || '',
        email: companyEditando.email || '',
        telefonePrincipal: companyEditando.telefonePrincipal || '',
        telefoneSecundario: companyEditando.telefoneSecundario || '',
        cep: companyEditando.cep || '',
        logradouro: companyEditando.logradouro || '',
        numero: companyEditando.numero || '',
        complemento: companyEditando.complemento || '',
        bairro: companyEditando.bairro || '',
        cidade: companyEditando.cidade || '',
        uf: companyEditando.uf || '',
        observacoes: companyEditando.observacoes || '',
      });
    } else {
      setFormData({
        cnpj: '', razaoSocial: '', nomeFantasia: '', email: '',
        telefonePrincipal: '', telefoneSecundario: '', cep: '',
        logradouro: '', numero: '', complemento: '', bairro: '',
        cidade: '', uf: '', observacoes: ''
      });
    }
  }, [companyEditando]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const buscarCNPJ = async () => {
    const cnpjLimpo = formData.cnpj?.replace(/\D/g, '');
    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
      addToast('Informe um CNPJ válido para buscar.', 'warning');
      return;
    }

    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razao_social || prev.razaoSocial,
        nomeFantasia: data.nome_fantasia || data.razao_social || prev.nomeFantasia,
        telefonePrincipal: data.ddd_telefone_1 || prev.telefonePrincipal,
        email: data.email || prev.email,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
      }));
      addToast('Dados da empresa importados!', 'success');
    } catch (error) {
      addToast('CNPJ não encontrado ou serviço indisponível.', 'error');
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const buscarCEP = async () => {
    const cepLimpo = formData.cep?.replace(/\D/g, '');
    if (!cepLimpo || cepLimpo.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`);
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        logradouro: data.street || prev.logradouro,
        bairro: data.neighborhood || prev.bairro,
        cidade: data.city || prev.cidade,
        uf: data.state || prev.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (companyEditando) {
        await companyService.update(companyEditando.id, formData);
        addToast('Empresa atualizada com sucesso!', 'success');
      } else {
        await companyService.create(formData);
        addToast('Empresa cadastrada com sucesso!', 'success');
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Erro ao salvar empresa.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    formData, 
    handleChange, 
    handleSave, 
    isLoading, 
    isLoadingCnpj, 
    isLoadingCep, 
    buscarCNPJ, 
    buscarCEP 
  };
}