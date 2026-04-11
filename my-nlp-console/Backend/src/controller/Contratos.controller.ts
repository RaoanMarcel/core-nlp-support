import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// 1. Rota para Dar Lock / Iniciar Atendimento
app.post('/api/prospects/:id/lock', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body; // ID do usuário logado fazendo a requisição

  try {
    // Tenta atualizar SOMENTE se o status for PENDENTE
    const result = await prisma.prospect.updateMany({
      where: { 
        id, 
        status: 'PENDENTE' 
      },
      data: { 
        status: 'EM_ATENDIMENTO',
        lockedBy: userId,
        lockedAt: new Date()
      }
    });

    // Se count for 0, significa que o prospect não estava mais PENDENTE
    if (result.count === 0) {
      return res.status(409).json({ 
        error: 'Este cliente já está em atendimento por outro usuário.' 
      });
    }

    // Retorna o prospect atualizado
    const prospect = await prisma.prospect.findUnique({ where: { id } });
    res.json(prospect);

    // DICA: Aqui você emitiria um evento Socket.io para os outros clientes atualizarem a tela
    // io.emit('prospect-locked', { prospectId: id, status: 'EM_ATENDIMENTO' });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao tentar travar o cliente.' });
  }
});

// 2. Rota para Finalizar Atendimento
app.post('/api/prospects/:id/finish', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { observacoes, novosModulos, acao, userId } = req.body; // acao = 'APROVADO' | 'REPROVADO'

  try {
    const prospect = await prisma.prospect.updateMany({
      where: { 
        id, 
        lockedBy: userId // Garante que só quem travou pode finalizar
      },
      data: {
        observacoes,
        novosModulos,
        status: acao,
        lockedBy: null, // Libera o lock
        lockedAt: null
      }
    });

    if (prospect.count === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para finalizar este atendimento ou ele já foi finalizado.' });
    }

    res.json({ message: 'Atendimento finalizado com sucesso!' });
    
    // DICA: io.emit('prospect-finished', { prospectId: id, status: acao });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao finalizar atendimento.' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));