import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();

export class QuoteController {
  
  // Lista todos (com ordenação)
  async list(req: Request, res: Response) {
    try {
      const quotes = await prisma.quote.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(quotes);
    } catch (error) {
      console.error('Erro na listagem:', error);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  // Busca por filtros específicos
  async consultar(req: Request, res: Response) {
    try {
      const { termo, dataInicio, dataFim, status } = req.query;
      
      console.log('Filtros recebidos:', { termo, status, dataInicio, dataFim });

      let whereOptions: Prisma.QuoteWhereInput = {};

      if (termo && typeof termo === 'string' && termo.trim() !== '') {
        const cleanTerm = termo.trim();
        const onlyNumbers = cleanTerm.replace(/\D/g, ''); 
        
        const orConditions: Prisma.QuoteWhereInput[] = [
          { nomeCliente: { contains: cleanTerm, mode: 'insensitive' } },
          { email: { contains: cleanTerm, mode: 'insensitive' } }
        ];

        if (onlyNumbers.length > 0) {
          orConditions.push({ cnpj: { contains: onlyNumbers } });
        }

        const numTerm = parseInt(onlyNumbers, 10);
        if (!isNaN(numTerm) && onlyNumbers.length < 10) {
          orConditions.push({ id: numTerm });
        }

        whereOptions.OR = orConditions;
      }

      if (status && status !== 'TODOS') {
        whereOptions.status = String(status);
      }

      if (dataInicio && dataFim) {
        whereOptions.createdAt = {
          gte: new Date(`${dataInicio}T00:00:00.000Z`),
          lte: new Date(`${dataFim}T23:59:59.999Z`),
        };
      }

      const quotes = await prisma.quote.findMany({
        where: whereOptions,
        orderBy: { createdAt: 'desc' },
      });

      return res.json(quotes);
    } catch (error) {
      console.error('Erro na consulta:', error);
      return res.status(500).json({ error: 'Erro ao consultar' });
    }
  }

 // ATUALIZADO: Busca o orçamento trazendo o histórico de notas ordenado
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const quote = await prisma.quote.findUnique({
        where: { id: Number(id) },
        include: {
          notas: {
            orderBy: { createdAt: 'desc' } // Traz da mais nova para a mais antiga (ou 'asc' se preferir)
          }
        }
      });

      if (!quote) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      return res.json(quote);
    } catch (error) {
      console.error('Erro ao buscar orçamento por ID:', error);
      return res.status(500).json({ error: 'Erro ao buscar o orçamento' });
    }
  }

  async addNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { texto, usuario } = req.body;

      if (!texto || !usuario) {
        return res.status(400).json({ error: 'Texto e usuário são obrigatórios' });
      }

      const note = await prisma.quoteNote.create({
        data: {
          quoteId: Number(id),
          texto,
          usuario
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('quote:note_added', note);
      }

      return res.status(201).json(note);
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      return res.status(500).json({ error: 'Erro ao adicionar nota' });
    }
  }
  // Cria um novo orçamento
  async create(req: Request, res: Response) {
    try {
      const { 
        nomeCliente, cnpj, endereco, email, 
        telefonePrincipal, telefoneSecundario, 
        modulos, plano, valorBase, valorNegociado,
        interesses, observacoes, status 
      } = req.body;

      const cleanCnpj = cnpj ? cnpj.replace(/\D/g, '') : undefined;

      const quote = await prisma.quote.create({
        data: {
          nomeCliente,
          cnpj: cleanCnpj,
          endereco,
          email,
          telefonePrincipal,
          telefoneSecundario,
          modulos,
          plano,
          valorBase: Number(valorBase),
          valorNegociado: Number(valorNegociado),
          interesses,
          observacoes,
          status: status || 'RASCUNHO' 
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('quote:created', quote);
      }

      return res.status(201).json(quote);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      return res.status(400).json({ error: 'Erro ao criar pedido' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        nomeCliente, cnpj, endereco, email, 
        telefonePrincipal, telefoneSecundario, 
        modulos, plano, valorBase, valorNegociado,
        interesses, observacoes, status 
      } = req.body;

      const cleanCnpj = cnpj ? cnpj.replace(/\D/g, '') : undefined;

      const quote = await prisma.quote.update({
        where: { id: Number(id) }, 
        data: {
          ...(nomeCliente && { nomeCliente }),
          ...(cleanCnpj && { cnpj: cleanCnpj }),
          ...(endereco !== undefined && { endereco }),
          ...(email !== undefined && { email }),
          ...(telefonePrincipal !== undefined && { telefonePrincipal }),
          ...(telefoneSecundario !== undefined && { telefoneSecundario }),
          ...(modulos && { modulos }),
          ...(plano && { plano }),
          ...(valorBase !== undefined && { valorBase: Number(valorBase) }),
          ...(valorNegociado !== undefined && { valorNegociado: Number(valorNegociado) }),
          ...(interesses !== undefined && { interesses }),
          ...(observacoes !== undefined && { observacoes }),
          ...(status && { status })
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('quote:updated', quote);
      }

      return res.json(quote);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      return res.status(400).json({ error: 'Erro ao atualizar pedido' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.quote.delete({
        where: { id: Number(id) }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('quote:deleted', { id: Number(id) });
      }

      return res.status(204).send(); // 204 No Content
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      return res.status(400).json({ error: 'Erro ao deletar pedido' });
    }
  }
  
  async forceStatusUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { novoStatus, usuarioLogin, senha } = req.body;

      if (!novoStatus || !usuarioLogin || !senha) {
        return res.status(400).json({ error: 'Dados insuficientes para forçar status.' });
      }

      const user = await prisma.user.findUnique({ where: { usuario: usuarioLogin } });
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha incorreta. Ação negada.' });
      }

      const quote = await prisma.quote.update({
        where: { id: Number(id) },
        data: { status: novoStatus }
      });

      const note = await prisma.quoteNote.create({
        data: {
          quoteId: Number(id),
          texto: `⚠️ STATUS FORÇADO PARA: ${novoStatus}. Ação autorizada mediante senha.`,
          usuario: user.nome
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('quote:updated', quote);
        io.emit('quote:note_added', note);
      }

      return res.json({ quote, note });
    } catch (error) {
      console.error('Erro ao forçar atualização de status:', error);
      return res.status(500).json({ error: 'Erro interno ao forçar status.' });
    }
  }
  }