import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_super_secreta_123';

export interface TokenPayload {
  userId: string;
  nome: string;
  roleId: string | null;
  permissions: string[];
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido. Faça login.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    
    (req as any).user = decoded; 
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado. Sessão encerrada.' });
  }
};


export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as TokenPayload;

    // Se o usuário não tiver permissões ou não incluir a necessária, é bloqueado com 403
    if (!user || !user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Acesso Negado: Você não tem privilégios suficientes para executar esta ação.' 
      });
    }

    next();
  };
};