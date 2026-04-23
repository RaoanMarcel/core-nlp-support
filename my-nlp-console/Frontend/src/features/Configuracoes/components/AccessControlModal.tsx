import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, ShieldAlert, Loader2, Users, KeyRound, UserMinus } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useToast } from '../../../contexts/ToastContext'; // Importando o Toast customizado!
import type { IRole, IPermission } from '../../../types/access.types';
import { api } from '../../../services/api';

interface AccessControlModalProps {
  onClose: () => void;
}

interface IUser {
  id: string;
  nome: string;
  usuario: string;
  roleId: string | null;
}

export default function AccessControlModal({ onClose }: AccessControlModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef as React.RefObject<HTMLDivElement>, onClose);
  
  const { addToast } = useToast(); // Iniciando o Hook

  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  
  const [activeRoleId, setActiveRoleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        setIsLoading(true);
        const [rolesRes, permsRes, usersRes] = await Promise.all([
          api.get('/roles'),
          api.get('/roles/permissions'),
          api.get('/users')
        ]);

        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
        setUsers(usersRes.data);

        if (rolesRes.data.length > 0) setActiveRoleId(rolesRes.data[0].id);
      } catch (error) {
        addToast('Erro ao carregar dados do sistema.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrixData();
  }, [addToast]);

  const activeRole = roles.find(r => r.id === activeRoleId);

  const togglePermission = (permissionSlug: string) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id !== activeRoleId) return role;
      const hasPerm = role.permissions.includes(permissionSlug);
      return {
        ...role,
        permissions: hasPerm 
          ? role.permissions.filter(p => p !== permissionSlug) 
          : [...role.permissions, permissionSlug]              
      };
    }));
  };

  const handleSaveChanges = async () => {
    if (!activeRole) return;
    try {
      setIsSaving(true);
      await api.put(`/roles/${activeRole.id}`, {
        nome: activeRole.nome,
        permissions: activeRole.permissions
      });
      addToast('Permissões atualizadas com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao salvar as permissões.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.post('/roles', { nome: newRoleName.trim(), permissions: [] });
      const novaRole: IRole = { id: res.data.id, nome: newRoleName.trim(), permissions: [] };
      
      setRoles(prev => [...prev, novaRole]);
      setActiveRoleId(novaRole.id);
      setActiveTab('permissions');
      
      setNewRoleName('');
      setIsCreateModalOpen(false);
      addToast('Novo cargo criado!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.error || "Erro ao criar o cargo.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignUser = async (userId: string, roleId: string | null) => {
    try {
      await api.put(`/users/${userId}/role`, { roleId });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roleId } : u));
      addToast(roleId ? 'Usuário vinculado!' : 'Usuário desvinculado!', 'success');
    } catch (error) {
      addToast("Erro ao alterar cargo do usuário.", 'error');
    }
  };

  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.modulo]) acc[perm.modulo] = [];
    acc[perm.modulo].push(perm);
    return acc;
  }, {} as Record<string, IPermission[]>);

  const usersInActiveRole = users.filter(u => u.roleId === activeRoleId);
  const availableUsers = users.filter(u => u.roleId !== activeRoleId);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-2 sm:p-6 backdrop-blur-sm bg-black/50 transition-all">
      <div 
        ref={modalRef}
        className="w-full max-w-6xl h-[95vh] sm:h-auto sm:max-h-[90vh] bg-theme-panel rounded-shape-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative border border-theme-border"
      >
        
        {isCreateModalOpen && (
          <div className="absolute inset-0 z-90 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <form 
              onSubmit={handleConfirmCreateRole}
              className="bg-theme-panel rounded-shape-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-theme-border"
            >
              <div className="p-5 sm:p-6">
                <h3 className="font-bold text-lg text-theme-text mb-2">Novo Cargo</h3>
                <p className="text-sm text-theme-muted mb-4">Como você deseja chamar este novo nível de acesso?</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ex: Comercial"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full border border-theme-border bg-theme-base rounded-shape px-4 py-3 text-theme-text outline-none focus:ring-2 focus:ring-theme-accent transition-all placeholder:text-theme-muted"
                />
              </div>
              <div className="flex border-t border-theme-border">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-6 py-3 sm:py-4 text-sm font-semibold text-theme-muted hover:bg-theme-base transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newRoleName.trim()}
                  className="flex-1 px-6 py-3 sm:py-4 text-sm font-bold text-theme-accent hover:bg-theme-accent-soft disabled:opacity-50 transition-colors border-l border-theme-border"
                >
                  Criar Cargo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-6 border-b border-theme-border bg-theme-base/50 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-theme-accent-soft text-theme-accent rounded-shape shrink-0">
              <ShieldAlert size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-theme-text leading-tight">Matriz de Permissões</h2>
              <p className="text-xs sm:text-sm text-theme-muted hidden sm:block">Configure os acessos e vincule sua equipe.</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-base rounded-full transition-colors disabled:opacity-50">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-theme-muted">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-theme-accent" />
            <p className="text-sm font-medium">Carregando dados do sistema...</p>
          </div>
        ) : (
          // ESTRATÉGIA MOBILE: Flex-col no celular (lista em cima, tabs embaixo) e Flex-row no desktop (sidebar na esquerda)
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* CARGOS: Barra superior no mobile (rolável horizontalmente), Sidebar no desktop */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-theme-border bg-theme-base/30 flex flex-col shrink-0 md:shrink">
              <div className="p-3 md:p-4 border-b border-theme-border flex justify-between items-center shrink-0">
                <span className="text-[10px] md:text-xs font-bold text-theme-muted uppercase tracking-wider">Cargos ({roles.length})</span>
                <button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="text-[10px] md:text-xs font-bold text-theme-accent hover:opacity-80 flex items-center gap-1 transition-opacity"
                >
                  <Plus size={14} /> NOVO
                </button>
              </div>
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-3 md:p-4 gap-2 md:gap-2 custom-scrollbar shrink-0 md:flex-1">
                {roles.map(role => {
                  const userCount = users.filter(u => u.roleId === role.id).length;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRoleId(role.id)}
                      className={`w-45 md:w-full shrink-0 flex flex-col md:flex-row md:items-center justify-between p-3 rounded-shape transition-all text-left ${
                        activeRoleId === role.id 
                          ? 'bg-theme-accent text-white shadow-md border border-theme-accent' 
                          : 'bg-theme-panel border border-theme-border text-theme-text hover:border-theme-accent/50 hover:shadow-sm'
                      }`}
                    >
                      <span className="font-semibold text-sm mb-1 md:mb-0 truncate pr-2">{role.nome}</span>
                      <div className="flex gap-1 shrink-0 mt-1 md:mt-0">
                        <span className={`text-[10px] px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-white/20 text-white' : 'bg-theme-base text-theme-muted'
                        }`}>
                           {role.permissions.length} perms
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-bold flex items-center gap-1 ${
                          activeRoleId === role.id ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                           <Users size={10} /> {userCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTEÚDO PRINCIPAL (Permissões ou Usuários) */}
            <div className="w-full md:w-2/3 flex flex-col bg-theme-panel flex-1 min-h-0">
              <div className="px-4 pt-4 md:px-6 md:pt-6 border-b border-theme-border bg-theme-panel shrink-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 md:mb-6 gap-3">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-theme-text">{activeRole?.nome}</h3>
                    <p className="text-xs md:text-sm text-theme-muted">Configure os detalhes deste cargo.</p>
                  </div>
                  {activeTab === 'permissions' && (
                    <button 
                      onClick={handleSaveChanges}
                      disabled={isSaving || !activeRole}
                      className="w-full sm:w-auto flex justify-center items-center gap-2 bg-theme-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-shape font-semibold text-sm transition-all shadow-sm"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar Permissões
                    </button>
                  )}
                </div>

                <div className="flex gap-4 md:gap-6 overflow-x-auto custom-scrollbar">
                  <button 
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-3 font-semibold text-xs md:text-sm flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'permissions' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <KeyRound size={16} /> Acessos do Cargo
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 font-semibold text-xs md:text-sm flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'users' ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    <Users size={16} /> Usuários Vinculados
                    <span className="bg-theme-base text-theme-text py-0.5 px-2 rounded-full text-[10px] md:text-xs">{usersInActiveRole.length}</span>
                  </button>
                </div>
              </div>

              {/* ÁREA DE ROLAGEM PRINCIPAL */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-theme-base/30">
                {activeTab === 'permissions' && (
                  <div className="space-y-6 md:space-y-8 pb-10">
                    {Object.entries(permissionsByModule).map(([modulo, perms]) => (
                      <div key={modulo}>
                        <h4 className="text-xs md:text-sm font-bold text-theme-muted uppercase tracking-wider mb-3 md:mb-4 pb-2 border-b border-theme-border">
                          {modulo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {perms.map(perm => {
                            const isChecked = activeRole?.permissions.includes(perm.slug) || false;
                            return (
                              <label key={perm.id} className={`flex items-start gap-3 p-3 md:p-4 rounded-shape-lg border cursor-pointer transition-all ${isChecked ? 'border-theme-accent bg-theme-accent-soft/30' : 'border-theme-border hover:border-theme-accent/30 bg-theme-panel'}`}>
                                <input type="checkbox" className="mt-0.5 w-4 h-4 text-theme-accent rounded border-theme-border focus:ring-theme-accent cursor-pointer bg-theme-base" checked={isChecked} onChange={() => togglePermission(perm.slug)} />
                                <div>
                                  <p className={`text-sm font-bold leading-tight ${isChecked ? 'text-theme-text' : 'text-theme-text/80'}`}>{perm.descricao}</p>
                                  <p className="text-[10px] text-theme-muted mt-1.5 font-mono bg-theme-base px-1.5 py-0.5 rounded inline-block">{perm.slug}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-10">
                    <div className="bg-theme-panel border border-theme-border rounded-shape-lg overflow-hidden shadow-sm">
                      <div className="p-3 md:p-4 border-b border-theme-border bg-theme-base flex justify-between items-center">
                        <h4 className="font-semibold text-theme-text text-sm md:text-base">Equipe Atual ({usersInActiveRole.length})</h4>
                      </div>
                      
                      {usersInActiveRole.length === 0 ? (
                        <div className="p-6 md:p-8 text-center text-theme-muted text-sm">
                          Nenhum usuário vinculado a este cargo ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-theme-border">
                          {usersInActiveRole.map(user => (
                            <div key={user.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 hover:bg-theme-base/50 transition-colors gap-3 sm:gap-0">
                              <div>
                                <p className="font-bold text-theme-text text-sm">{user.nome}</p>
                                <p className="text-xs text-theme-muted">@{user.usuario}</p>
                              </div>
                              <button 
                                onClick={() => handleAssignUser(user.id, null)}
                                className="w-full sm:w-auto justify-center text-red-500 bg-red-50 sm:bg-transparent border border-red-100 sm:border-transparent hover:bg-red-500/10 p-2 rounded-shape flex items-center gap-2 text-sm font-semibold transition-colors"
                              >
                                <UserMinus size={16} /> Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-theme-panel border border-theme-border rounded-shape-lg p-4 md:p-6 shadow-sm">
                      <h4 className="font-semibold text-theme-text mb-1 text-sm md:text-base">Vincular novo usuário</h4>
                      <p className="text-xs md:text-sm text-theme-muted mb-4">Selecione um usuário para atribuir este cargo.</p>
                      
                      <select 
                        className="w-full border border-theme-border bg-theme-base rounded-shape p-3 text-sm md:text-base text-theme-text outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignUser(e.target.value, activeRoleId);
                            e.target.value = "";
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled className="bg-theme-panel">Selecione um usuário...</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id} className="bg-theme-panel">
                            {user.nome} (@{user.usuario}) - {user.roleId ? 'Mudar cargo' : 'Sem cargo'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}