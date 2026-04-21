export type Theme = 'OCEAN' | 'MIDNIGHT' | 'COFFEE';
export type Shape = 'SHARP' | 'MODERN' | 'SOFT';

export interface AuthUser {
  id: string;
  nome: string;
  usuario: string;
  role: string | null;
  permissions: string[];
  theme: Theme;
  shape: Shape;
}