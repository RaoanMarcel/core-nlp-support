import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateOrUpdateRoleDTO {
  nome: string;
  permissions: string[];
}

export class RolesController {
  
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: { permission: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const formattedRoles = roles.map(role => ({
        id: role.id,
        nome: role.nome,
        permissions: role.permissions.map(rp => rp.permission.slug)
      }));

      return res.json(formattedRoles);
    } catch (error) {
      console.error("Erro ao listar cargos:", error);
      return res.status(500).json({ error: 'Erro interno ao buscar cargos.' });
    }
  };

  listarPermissoes = async (req: Request, res: Response): Promise<Response> => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: { modulo: 'asc' }
      });
      return res.json(permissions);
    } catch (error) {
      console.error("Erro ao listar permissões:", error);
      return res.status(500).json({ error: 'Erro interno ao buscar permissões.' });
    }
  };

  criar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { nome, permissions } = req.body as CreateOrUpdateRoleDTO;

      if (!nome || nome.trim() === '') {
        return res.status(400).json({ error: 'O nome do cargo é obrigatório.' });
      }

      const nomeLimpo = nome.trim();

      const roleExiste = await prisma.role.findUnique({ where: { nome: nomeLimpo } });
      if (roleExiste) {
        return res.status(400).json({ error: 'Já existe um cargo com este nome.' });
      }

      const permissoesDb = await prisma.permission.findMany({
        where: { slug: { in: permissions } }
      });

      const novaRole = await prisma.role.create({
        data: {
          nome: nomeLimpo,
          permissions: {
            create: permissoesDb.map(p => ({
              permission: { connect: { id: p.id } }
            }))
          }
        }
      });

      const io = req.app.get('io');
      if (io) io.emit('roles:updated');

      return res.status(201).json({ message: 'Cargo criado com sucesso!', id: novaRole.id });
    } catch (error) {
      console.error("Erro ao criar cargo:", error);
      return res.status(500).json({ error: 'Erro ao criar cargo.' });
    }
  };

  atualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { nome, permissions } = req.body as CreateOrUpdateRoleDTO;

      // 1. Busca as permissões pelo slug
      const permissoesDb = await prisma.permission.findMany({
        where: { slug: { in: permissions || [] } }
      });

      // 2. Atualiza de forma aninhada (Isso cria uma transação automática e segura no Prisma)
      await prisma.role.update({
        where: { id },
        data: {
          ...(nome && nome.trim() !== '' ? { nome: nome.trim() } : {}),
          permissions: {
            deleteMany: {}, // Limpa todas as relações antigas na tabela pivô
            create: permissoesDb.map(p => ({
              permission: { connect: { id: p.id } }
            }))
          }
        }
      });

      const io = req.app.get('io');
      if (io) io.emit('roles:updated');

      return res.json({ message: 'Matriz de permissões atualizada com sucesso!' });
    } catch (error) {
      console.error("Erro ao atualizar cargo:", error);
      return res.status(500).json({ error: 'Erro ao atualizar cargo e permissões.' });
    }
  };

  excluir = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const usuariosComEsteCargo = await prisma.user.count({
        where: { roleId: id }
      });

      if (usuariosComEsteCargo > 0) {
        return res.status(400).json({ 
          error: `Não é possível excluir. Existem ${usuariosComEsteCargo} usuário(s) vinculado(s) a este cargo.` 
        });
      }

      await prisma.role.delete({ where: { id } });

      const io = req.app.get('io');
      if (io) io.emit('roles:updated');

      return res.json({ message: 'Cargo excluído com sucesso!' });
    } catch (error) {
      console.error("Erro ao excluir cargo:", error);
      return res.status(500).json({ error: 'Erro ao excluir cargo.' });
    }
  };
}