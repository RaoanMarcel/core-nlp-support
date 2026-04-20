import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsersController {
  // Retorna todos os usuários (sem a senha, por segurança)
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, nome: true, usuario: true, roleId: true },
        orderBy: { nome: 'asc' }
      });
      return res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
    }
  };

  // Atualiza o cargo de um usuário específico
  atribuirCargo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { roleId } = req.body; // Pode ser null para remover o cargo

      await prisma.user.update({
        where: { id },
        data: { roleId: roleId || null }
      });

      return res.json({ message: 'Cargo do usuário atualizado com sucesso!' });
    } catch (error) {
      console.error("Erro ao atribuir cargo:", error);
      return res.status(500).json({ error: 'Erro ao alterar o cargo do usuário.' });
    }
  };
}