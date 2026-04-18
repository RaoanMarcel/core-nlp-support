export interface User {
  id: string;
  nome: string;
  email?: string;
  [key: string]: any;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  error?: string;
  requirePasswordChange?: boolean;
  message?: string;
}

export interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}