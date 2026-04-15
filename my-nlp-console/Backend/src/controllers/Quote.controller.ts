import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class QuoteController {

  async consultar(req: Request, res: Response) {
    try {
      const { termo, dataInicio, dataFim, status } = req.query;
      
      console.log('Filtros recebidos:', { termo, status, dataInicio, dataFim });

      let whereOptions: Prisma.QuoteWhereInput = {};

      if (termo && typeof termo === 'string' && termo.trim() !== '') {
        const cleanTerm = termo.trim();
        const onlyNumbers = cleanTerm.replace(/\D/g, ''); // Remove tudo que não é número
        
        // Criamos as condições básicas (Nome e Email sempre)
        const orConditions: Prisma.QuoteWhereInput[] = [
          { nomeCliente: { contains: cleanTerm, mode: 'insensitive' } },
          { email: { contains: cleanTerm, mode: 'insensitive' } }
        ];

        // SÓ busca por CNPJ se o usuário digitou algum número
        if (onlyNumbers.length > 0) {
          orConditions.push({ cnpj: { contains: onlyNumbers } });
        }

        // SÓ busca por ID se for um número válido e não muito longo
        const numTerm = parseInt(onlyNumbers, 10);
        if (!isNaN(numTerm) && onlyNumbers.length < 10) {
          orConditions.push({ id: numTerm });
        }

        whereOptions.OR = orConditions;
      }

      // Filtro de Status
      if (status && status !== 'TODOS') {
        whereOptions.status = String(status);
      }

      // Filtro de Data
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
  
  async list(req: Request, res: Response) {
    try {
      const quotes = await prisma.quote.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json(quotes);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { 
        nomeCliente, cnpj, endereco, email, 
        telefonePrincipal, telefoneSecundario, 
        modulos, plano, valorBase, valorNegociado,
        interesses, observacoes, status 
      } = req.body;

      const cleanCnpj = cnpj.replace(/\D/g, '');

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
}