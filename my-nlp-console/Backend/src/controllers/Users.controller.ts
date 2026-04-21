import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsersController {
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

  atribuirCargo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

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

  atualizarPreferencias = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { theme, shape } = req.body;

      if (!theme && !shape) {
        return res.status(400).json({ error: 'Nenhuma preferência informada para atualização.' });
      }

      const usuarioAtualizado = await prisma.user.update({
        where: { id },
        data: { 
          ...(theme && { theme }),
          ...(shape && { shape })
        },
        select: {
          id: true,
          theme: true,
          shape: true
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit(`user:${id}:settings_updated`, { 
          theme: usuarioAtualizado.theme, 
          shape: usuarioAtualizado.shape 
        });
      }

      return res.json({ 
        message: 'Preferências atualizadas com sucesso!', 
        settings: usuarioAtualizado 
      });

    } catch (error) {
      console.error("Erro ao atualizar preferências:", error);
      return res.status(500).json({ error: 'Erro interno ao atualizar preferências do usuário.' });
    }
  };
}