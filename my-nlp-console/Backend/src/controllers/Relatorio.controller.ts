import { Request, Response } from 'express';
import { PrismaClient, StatusAtendimento } from '@prisma/client';

const prisma = new PrismaClient();

export class RelatorioController {
  
  // ==========================================
  // NOVA FUNÇÃO: ESTATÍSTICAS PARA O DASHBOARD
  // ==========================================
  obterRelatorioStats = async (req: Request, res: Response) => {
    try {
      // Agrega os totais por status para alimentar os gráficos/cards do relatório
      const stats = await prisma.prospect.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      // Busca os últimos atendimentos convertidos em "Possibilidade" para uma tabela rápida
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

      const startDate = new Date(`${dataInicial}T00:00:00.000Z`);
      const endDate = new Date(`${dataFinal}T23:59:59.999Z`);

      if (modulo === 'prospects') {
        
        const selectOptions: any = {};
        dimensoes.forEach((dim: string) => {
          selectOptions[dim] = true;
        });

        const whereOptions: any = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        };

        if (statusFilter && statusFilter !== 'TODOS') {
          whereOptions.status = statusFilter as StatusAtendimento;
        }

        const prospects = await prisma.prospect.findMany({
          where: whereOptions,
          select: selectOptions,
          orderBy: {
            createdAt: 'desc'
          }
        });

        const dadosFormatados = prospects.map((item: any) => {
          const row: any = { ...item };
          
          if (row.novosModulos && Array.isArray(row.novosModulos)) {
            row.novosModulos = row.novosModulos.join(', ');
          }

          if (row.clienteWLE !== undefined && row.clienteWLE !== null) {
            row.clienteWLE = row.clienteWLE ? 'Sim' : 'Não';
          }

          if (row.createdAt) {
            row.createdAt = new Date(row.createdAt).toLocaleDateString('pt-BR');
          }
          if (row.dataAtendimento) {
            row.dataAtendimento = new Date(row.dataAtendimento).toLocaleDateString('pt-BR');
          }
          if (row.updatedAt) {
            row.updatedAt = new Date(row.updatedAt).toLocaleDateString('pt-BR');
          }

          if (metricas && metricas.includes('volume')) {
            row.volume = 1;
          }

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