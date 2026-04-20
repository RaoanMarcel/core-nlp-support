// core-nlp-support/my-nlp-console/Frontend/src/features/Configuracoes/hooks/useHasPermission.ts

export const useHasPermission = () => {
  const userJson = localStorage.getItem('@CRM:user');
  const user = userJson ? JSON.parse(userJson) : null;

  const hasPermission = (slug: string) => {
    if (!user) return false;
    
    if (user.role === 'DEV') return true;

    return user.permissions?.includes(slug) || false;
  };

  return { hasPermission };
};