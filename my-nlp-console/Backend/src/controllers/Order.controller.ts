import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class OrderController {
  
  gerarPedido = async (req: Request, res: Response): Promise<Response | any> => {
    try {
      const { quoteId } = req.body;

      if (!quoteId) {
        return res.status(400).json({ error: 'O ID do orçamento (quoteId) é obrigatório.' });
      }

      const quote = await prisma.quote.findUnique({ 
        where: { id: Number(quoteId) } 
      });

      if (!quote) {
        return res.status(404).json({ error: 'Orçamento não encontrado.' });
      }

      const pedidoExistente = await prisma.order.findUnique({
        where: { quoteId: quote.id }
      });

      if (pedidoExistente) {
        return res.status(400).json({ error: 'Já existe um pedido gerado para este orçamento.' });
      }

      const tokenAssinatura = uuidv4();

      const order = await prisma.order.create({
        data: {
          quoteId: quote.id,
          valorTotal: quote.valorNegociado || quote.valorBase,
          modulos: quote.modulos,
          tokenAssinatura,
          status: 'PENDENTE_ASSINATURA'
        }
      });

      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'APROVADO' }
      });

      // 6. Monta o link mágico que será copiado pelo vendedor
      // Em produção, troque o localhost pelo domínio do seu frontend
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const linkAssinatura = `${baseUrl}/aceite/${tokenAssinatura}`;

      return res.status(201).json({
        message: 'Pedido gerado com sucesso.',
        order,
        linkAssinatura
      });

    } catch (error) {
      console.error('[OrderController.gerarPedido] Erro:', error);
      return res.status(500).json({ error: 'Erro interno ao gerar pedido.' });
    }
  };

  assinarPedido = async (req: Request, res: Response): Promise<Response | any> => {
    try {
      const { token } = req.params;
      const { assinaturaBase64 } = req.body;

      if (!assinaturaBase64) {
        return res.status(400).json({ error: 'A assinatura é obrigatória.' });
      }

      const order = await prisma.order.findUnique({ 
        where: { tokenAssinatura: token },
        include: { quote: true } 
      });

      if (!order) {
        return res.status(404).json({ error: 'Link de assinatura inválido ou expirado.' });
      }

      if (order.status !== 'PENDENTE_ASSINATURA') {
        return res.status(400).json({ error: 'Este contrato já foi assinado ou processado.' });
      }

      const orderAtualizado = await prisma.order.update({
        where: { id: order.id },
        data: {
          assinaturaUrl: assinaturaBase64,
          termoAceitoAt: new Date(),
          status: 'ASSINADO',
          ipAssinatura: req.ip || req.socket.remoteAddress
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('pedidoAssinado', orderAtualizado);
      }

      return res.status(200).json({
        message: 'Contrato assinado com sucesso!',
        order: orderAtualizado
      });

    } catch (error) {
      console.error('[OrderController.assinarPedido] Erro:', error);
      return res.status(500).json({ error: 'Erro interno ao processar assinatura.' });
    }
  };

  buscarDadosTermo = async (req: Request, res: Response): Promise<Response | any> => {
    try {
      const { token } = req.params;

      const order = await prisma.order.findUnique({ 
        where: { tokenAssinatura: token },
        include: { quote: true } 
      });

      if (!order) {
        return res.status(404).json({ error: 'Link inválido.' });
      }

      return res.status(200).json({
        cliente: order.quote.nomeCliente,
        cnpj: order.quote.cnpj,
        valorTotal: order.valorTotal,
        modulos: order.modulos,
        status: order.status
      });

    } catch (error) {
      console.error('[OrderController.buscarDadosTermo] Erro:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados do termo.' });
    }
  }
}