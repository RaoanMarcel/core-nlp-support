import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_super_secreta_123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido. Faça login.' });
  }

  // O padrão é "Bearer <token>"
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string, nome: string };
    
    // Injeta os dados do usuário na requisição para os controllers usarem
    (req as any).user = decoded; 
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado. Sessão encerrada.' });
  }
};