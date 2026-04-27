export function useCan() {
  const userStr = localStorage.getItem('@CRM:user');
  
  const can = (permission: string) => {
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    
    if (user.role === 'DEV') return true;

    return user.permissions?.includes(permission) || false;
  };

  return { can };
}