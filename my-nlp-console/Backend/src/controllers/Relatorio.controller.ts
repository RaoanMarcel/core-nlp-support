import { Request, Response } from 'express';
import { PrismaClient, StatusAtendimento } from '@prisma/client';

const prisma = new PrismaClient();

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_ATENDIMENTO: 'Em Atendimento',
  APROVADO: 'Interessado',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  REPROVADO: 'Não Interessado',
  POSSIBILIDADE: 'Possibilidade',
  RETORNAR: 'Retornar',
  CNPJ_BAIXADO: 'CNPJ Baixado'
};

const formatMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
};

export class RelatorioController {

  obterRelatorioStats = async (req: Request, res: Response) => {
    try {
      const stats = await prisma.prospect.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      const ultimasPossibilidades = await prisma.prospect.findMany({
        where: { status: 'POSSIBILIDADE' as StatusAtendimento }, 
        take: 5,
        orderBy: { dataAtendimento: 'desc' }
      });

      res.json({ stats, ultimasPossibilidades });
    } catch (error) {
      console.error('Erro ao gerar estatísticas do dashboard:', error);
      res.status(500).json({ error: 'Erro ao gerar estatísticas' });
    }
  };

  build = async (req: Request, res: Response): Promise<any> => {
    try {
      const { modulo, dataInicial, dataFinal, dimensoes, metricas, statusFilter } = req.body;

      if (!modulo || !dimensoes || dimensoes.length === 0) {
        return res.status(400).json({ error: 'Módulo e pelo menos uma dimensão são obrigatórios.' });
      }

      // ✨ VALIDAÇÃO DE SEGURANÇA (BLOQUEIO POR PERMISSÃO) ✨
      const user = (req as any).user; 
      const userPermissions = user?.permissions || [];
      
      // Mapeia qual permissão é exigida para o módulo que está sendo acessado
      const requiredPermission = modulo === 'prospects' ? 'reports:prospects' : (modulo === 'quotes' ? 'reports:quotes' : null);
      
      if (requiredPermission && !userPermissions.includes(requiredPermission)) {
        // Confirmação extra direto no banco para garantir os superpoderes de DEV ou DIRETOR
        const dbUser = await prisma.user.findUnique({ 
          where: { id: user.userId }, 
          include: { role: true } 
        });
        
        if (dbUser?.role?.nome !== 'DEV' && dbUser?.role?.nome !== 'DIRETOR') {
           return res.status(403).json({ error: `Você não tem permissão para gerar o relatório de ${modulo}.` });
        }
      }
      // ✨ FIM DA VALIDAÇÃO ✨

      const startDate = new Date(`${dataInicial}T00:00:00.000Z`);
      const endDate = new Date(`${dataFinal}T23:59:59.999Z`);

      // ==========================================
      // LÓGICA DO RELATÓRIO DE PROSPECTS
      // ==========================================
      if (modulo === 'prospects') {
        const selectOptions: any = {};
        dimensoes.forEach((dim: string) => { selectOptions[dim] = true; });

        const whereOptions: any = {
          createdAt: { gte: startDate, lte: endDate }
        };

        if (statusFilter && statusFilter !== 'TODOS') {
          whereOptions.status = statusFilter as StatusAtendimento;
        }

        const prospects = await prisma.prospect.findMany({
          where: whereOptions,
          select: selectOptions,
          orderBy: { createdAt: 'desc' }
        });

        const dadosFormatados = prospects.map((item: any) => {
          const row: any = { ...item };
          
          if (row.status) row.status = STATUS_LABELS[row.status] || row.status;
          if (row.novosModulos && Array.isArray(row.novosModulos)) row.novosModulos = row.novosModulos.join(', ');
          if (row.clienteWLE !== undefined && row.clienteWLE !== null) row.clienteWLE = row.clienteWLE ? 'Sim' : 'Não';
          if (row.createdAt) row.createdAt = new Date(row.createdAt).toLocaleDateString('pt-BR');
          if (row.dataAtendimento) row.dataAtendimento = new Date(row.dataAtendimento).toLocaleDateString('pt-BR');
          if (row.updatedAt) row.updatedAt = new Date(row.updatedAt).toLocaleDateString('pt-BR');
          if (metricas && metricas.includes('volume')) row.volume = 1;

          return row;
        });

        return res.json(dadosFormatados);
      }

      // ==========================================
      // LÓGICA DO RELATÓRIO DE ORÇAMENTOS
      // ==========================================
      if (modulo === 'quotes') {
        const selectOptions: any = {};
        dimensoes.forEach((dim: string) => { selectOptions[dim] = true; });

        const whereOptions: any = {
          createdAt: { gte: startDate, lte: endDate }
        };

        if (statusFilter && statusFilter !== 'TODOS') {
          whereOptions.status = statusFilter;
        }

        const quotes = await prisma.quote.findMany({
          where: whereOptions,
          select: selectOptions,
          orderBy: { createdAt: 'desc' }
        });

        const dadosFormatados = quotes.map((item: any) => {
          const row: any = { ...item };

          if (row.modulos && Array.isArray(row.modulos)) {
            row.modulos = row.modulos.join(', ');
          }

          if (row.valorBase !== undefined) row.valorBase = formatMoeda(row.valorBase);
          if (row.valorNegociado !== undefined) row.valorNegociado = formatMoeda(row.valorNegociado);
          if (row.valorUsuarioExtra !== undefined) row.valorUsuarioExtra = formatMoeda(row.valorUsuarioExtra);

          if (row.createdAt) row.createdAt = new Date(row.createdAt).toLocaleDateString('pt-BR');
          if (row.updatedAt) row.updatedAt = new Date(row.updatedAt).toLocaleDateString('pt-BR');

          if (metricas && metricas.includes('volume')) row.volume = 1;

          return row;
        });

        return res.json(dadosFormatados);
      }

      return res.status(400).json({ error: 'Módulo não configurado.' });

    } catch (error) {
      console.error('Erro na geração de relatório:', error);
      return res.status(500).json({ error: 'Erro interno ao processar o relatório.' });
    }
  };
}