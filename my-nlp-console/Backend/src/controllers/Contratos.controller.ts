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
      
      // Avisa TODOS os frontends para recarregarem a tela inteira!
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
      const prospectAtual = await prisma.prospect.findUnique({ where: { id } });
      
      if (prospectAtual?.status !== 'PENDENTE') {
        return res.status(409).json({ error: 'Cliente já está em atendimento' });
      }

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { status: 'EM_ATENDIMENTO' }
      });

      // Avisa todos os frontends enviando o card atualizado (para mudar a cor na hora)
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
      const { acao } = req.body; 

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { status: acao }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);

      res.json({ message: 'Atendimento finalizado!', prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao finalizar atendimento' });
    }
  };
}