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
      const prospectAtual = await prisma.prospect.findUnique({ where: { id } });
      
      // Ajuste na mensagem de erro: POSSIBILIDADES não passam pelo travar, 
      // mas se houver tentativa, ele bloqueia corretamente.
      if (prospectAtual?.status !== 'PENDENTE') {
        return res.status(409).json({ error: 'Cliente já está em atendimento ou já foi triado' });
      }

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { status: 'EM_ATENDIMENTO' }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json(atualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao travar cliente' });
    }
  };

  // ==========================================
  // FUNÇÃO MANTIDA: FINALIZAR
  // ==========================================
  finalizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // O campo 'acao' agora receberá também 'POSSIBILIDADE' do frontend
      const { acao, observacoes, novosModulos, atendidoPor } = req.body; 

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: acao,
          observacoes,
          novosModulos,
          atendidoPor, // Salva o nome do usuário
          dataAtendimento: new Date() // Salva a data atual
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: `Atendimento finalizado como ${acao}!`, prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao finalizar atendimento' });
    }
  };

  // ==========================================
  // FUNÇÃO ATUALIZADA: ATUALIZAR (Permite mudança de status)
  // ==========================================
  atualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Adicionado 'status' no desestruturamento do body
      const { observacoes, novosModulos, status } = req.body;

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: {
          observacoes,
          novosModulos,
          // Atualiza o status APENAS se o frontend enviar um novo status 
          // (ex: editando uma POSSIBILIDADE para virar APROVADO)
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