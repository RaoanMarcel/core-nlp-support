import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProspectController {
  
  buscarTodos = async (req: Request, res: Response) => {
    try {
      const lista = await prisma.prospect.findMany();
      res.json(lista);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar dados do banco' });
    }
  };

  importar = async (req: Request, res: Response) => {
    try {
      const { prospects } = req.body;
      await prisma.prospect.createMany({
        data: prospects,
        skipDuplicates: true 
      });
      
      req.app.get('io').emit('prospectsRefresh');
      res.status(201).json({ message: 'Planilha importada com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao salvar a planilha' });
    }
  };

  buscarHistorico = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const historico = await prisma.historicoAtendimento.findMany({
        where: { prospectId: id },
        orderBy: { createdAt: 'desc' } // Ordena do mais recente pro mais antigo
      });
      res.json(historico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  };

  travar = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { userName } = req.body; 
      
      const prospectAtual = await prisma.prospect.findUnique({ where: { id } });
      
      if (prospectAtual?.status !== 'PENDENTE') {
        return res.status(409).json({ error: 'Cliente já está em atendimento ou já foi triado' });
      }

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: 'EM_ATENDIMENTO',
          lockedBy: userName 
        }
      });

      // Salvar no histórico
      await prisma.historicoAtendimento.create({
        data: {
          prospectId: id,
          acao: 'Iniciou o Atendimento',
          usuario: userName,
          novosModulos: [],
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json(atualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao travar cliente' });
    }
  };

  finalizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Adicionado nomeFantasia e endereco aqui
      const { acao, observacoes, novosModulos, atendidoPor, nomeFantasia, endereco } = req.body; 

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: acao,
          observacoes, 
          novosModulos,
          atendidoPor,
          nomeFantasia, // Salva o nome fantasia se enviado
          endereco,     // Salva o endereço se enviado
          dataAtendimento: new Date() 
        }
      });

      // Salvar no histórico
      await prisma.historicoAtendimento.create({
        data: {
          prospectId: id,
          acao: `Finalizou como ${acao}`,
          observacoes,
          novosModulos: novosModulos || [],
          usuario: atendidoPor || 'Sistema'
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: `Atendimento finalizado como ${acao}!`, prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao finalizar atendimento' });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Adicionado nomeFantasia e endereco aqui
      const { observacoes, novosModulos, status, usuarioLogado, nomeFantasia, endereco } = req.body;

      // 1. Atualiza apenas módulos, status, nome fantasia e endereço no cadastro principal. 
      const atualizado = await prisma.prospect.update({
        where: { id },
        data: {
          novosModulos,
          nomeFantasia, // Atualiza se enviado
          endereco,     // Atualiza se enviado
          ...(status && { status }) 
        }
      });

      // 2. Cria o log de interação na linha do tempo
      if ((observacoes && observacoes.trim() !== '') || (novosModulos && novosModulos.length > 0)) {
        await prisma.historicoAtendimento.create({
          data: {
            prospectId: id,
            acao: 'Nova Interação', 
            observacoes: observacoes || null,
            novosModulos: novosModulos || [],
            usuario: usuarioLogado || 'Usuário Desconhecido'
          }
        });
      }

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: 'Informações atualizadas com sucesso!', prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar atendimento' });
    }
  };
}