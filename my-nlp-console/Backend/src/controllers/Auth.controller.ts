import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_super_secreta_123';

export class AuthController {
  
  login = async (req: Request, res: Response): Promise<any> => {
    try {
      const { usuario, senha } = req.body;

      // 1. Busca o usuário
      const user = await prisma.user.findUnique({ where: { usuario } });
      if (!user) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos' });
      }

      // 2. Compara a senha digitada com o Hash do banco
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

      // 4. Se não for primeiro acesso, gera o Token normalmente
      const token = jwt.sign(
        { userId: user.id, nome: user.nome }, 
        SECRET_KEY, 
        { expiresIn: '12h' }
      );

      return res.json({
        message: 'Login bem-sucedido',
        token,
        user: { id: user.id, nome: user.nome, usuario: user.usuario }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao fazer login' });
    }
  };

  // ROTA NOVA: Trocar a senha do primeiro acesso e já fazer login
  alterarSenhaPrimeiroAcesso = async (req: Request, res: Response): Promise<any> => {
    try {
      const { usuario, senhaAtual, novaSenha } = req.body;

      const user = await prisma.user.findUnique({ where: { usuario } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Confirma se ele realmente sabe a senha atual que você deu para ele
      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
      if (!senhaValida) return res.status(401).json({ error: 'Senha atual incorreta' });

      // Criptografa a nova senha
      const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

      // Atualiza o banco: nova senha e tira a flag de primeiro acesso
      const usuarioAtualizado = await prisma.user.update({
        where: { id: user.id },
        data: { 
          senha: hashNovaSenha,
          primeiroAcesso: false 
        }
      });

      // Já gera o token para ele não precisar logar de novo
      const token = jwt.sign(
        { userId: usuarioAtualizado.id, nome: usuarioAtualizado.nome }, 
        SECRET_KEY, 
        { expiresIn: '12h' }
      );

      return res.json({
        message: 'Senha alterada e login bem-sucedido!',
        token,
        user: { id: usuarioAtualizado.id, nome: usuarioAtualizado.nome, usuario: usuarioAtualizado.usuario }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao alterar a senha' });
    }
  };

  // Rota auxiliar para você cadastrar sua equipe
  registrar = async (req: Request, res: Response): Promise<any> => {
    try {
      const { nome, usuario, senha } = req.body;

      const existe = await prisma.user.findUnique({ where: { usuario } });
      if (existe) return res.status(400).json({ error: 'Usuário já existe' });

      const hashSenha = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.user.create({
        // Por padrão o Prisma já vai colocar primeiroAcesso como true!
        data: { nome, usuario, senha: hashSenha }
      });

      return res.status(201).json({ message: 'Usuário criado!', id: novoUsuario.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  };
}