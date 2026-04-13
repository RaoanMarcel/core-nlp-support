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

  travar = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { userName } = req.body; // Pegando o nome do usuário que veio do Front
      
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
      const { acao, observacoes, novosModulos, atendidoPor } = req.body; 

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: acao,
          observacoes,
          novosModulos,
          atendidoPor,
          dataAtendimento: new Date() 
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
      const { observacoes, novosModulos, status } = req.body;

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: {
          observacoes,
          novosModulos,
          ...(status && { status }) 
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: 'Informações atualizadas com sucesso!', prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar atendimento' });
    }
  };
}