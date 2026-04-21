import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_super_secreta_123';

export class AuthController {
  
  login = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { usuario, senha } = req.body;

      const user = await prisma.user.findUnique({ 
      where: { usuario },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

      if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
      }

      if (user.primeiroAcesso) {
        return res.status(403).json({ 
          requirePasswordChange: true, 
          usuario: user.usuario,
          message: 'Primeiro acesso detectado. É necessário alterar a senha.' 
        });
      }

      const userPermissions = user.role?.permissions.map(rp => rp.permission.slug) || [];

      const token = jwt.sign(
        { 
          userId: user.id, 
          nome: user.nome,
          roleId: user.roleId,
          permissions: userPermissions
        }, 
        SECRET_KEY, 
        { expiresIn: '12h' }
      );

      return res.json({
        message: 'Login bem-sucedido',
        token,
        user: { 
          id: user.id, 
          nome: user.nome, 
          usuario: user.usuario,
          role: user.role?.nome || null,
          permissions: user.role?.permissions.map(p => p.permission.slug) || [],
          theme: user.theme, 
          shape: user.shape  
        }
      });

    } catch (error) {
      console.error("Erro no AuthController.login:", error);
      return res.status(500).json({ error: 'Erro interno ao fazer login' });
    }
  };

  alterarSenhaPrimeiroAcesso = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { usuario, senhaAtual, novaSenha } = req.body;

      const user = await prisma.user.findUnique({ where: { usuario } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
      if (!senhaValida) return res.status(401).json({ error: 'Senha atual incorreta' });

      const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

      const usuarioAtualizado = await prisma.user.update({
        where: { id: user.id },
        data: { 
          senha: hashNovaSenha,
          primeiroAcesso: false 
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      });

      const userPermissions = usuarioAtualizado.role?.permissions.map(rp => rp.permission.slug) || [];

      const token = jwt.sign(
        { 
          userId: usuarioAtualizado.id, 
          nome: usuarioAtualizado.nome,
          roleId: usuarioAtualizado.roleId,
          permissions: userPermissions
        }, 
        SECRET_KEY, 
        { expiresIn: '12h' }
      );

      return res.json({
        message: 'Senha alterada e login bem-sucedido!',
        token,
        user: { 
          id: usuarioAtualizado.id, 
          nome: usuarioAtualizado.nome, 
          usuario: usuarioAtualizado.usuario,
          role: usuarioAtualizado.role?.nome || null,
          permissions: userPermissions,
          theme: usuarioAtualizado.theme, 
          shape: usuarioAtualizado.shape
        }
      });

    } catch (error) {
      console.error("Erro no AuthController.alterarSenhaPrimeiroAcesso:", error);
      return res.status(500).json({ error: 'Erro ao alterar a senha' });
    }
  };

  registrar = async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { nome, usuario, senha, roleId } = req.body; 

      const existe = await prisma.user.findUnique({ where: { usuario } });
      if (existe) return res.status(400).json({ error: 'Usuário já existe' });

      const hashSenha = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.user.create({
        data: { 
          nome, 
          usuario, 
          senha: hashSenha,
          ...(roleId && { roleId })
        }
      });

      return res.status(201).json({ message: 'Usuário criado com sucesso!', id: novoUsuario.id });
    } catch (error) {
      console.error("Erro no AuthController.registrar:", error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  };
}