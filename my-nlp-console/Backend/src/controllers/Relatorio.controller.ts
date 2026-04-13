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

  // ==========================================
  // FUNÇÃO MANTIDA: CONSTRUTOR DE RELATÓRIOS (CSV/TABELA)
  // ==========================================
  build = async (req: Request, res: Response): Promise<any> => {
    try {
      // Adicionamos statusFilter para ele poder tirar relatórios só de aprovados, reprovados, possibilidades, etc.
      const { modulo, dataInicial, dataFinal, dimensoes, metricas, statusFilter } = req.body;

      if (!modulo || !dimensoes || dimensoes.length === 0) {
        return res.status(400).json({ error: 'Módulo e pelo menos uma dimensão são obrigatórios.' });
      }

      const startDate = new Date(`${dataInicial}T00:00:00.000Z`);
      const endDate = new Date(`${dataFinal}T23:59:59.999Z`);

      if (modulo === 'prospects') {
        
        // 1. Monta quais colunas o Prisma deve trazer (Select Dinâmico)
        const selectOptions: any = {};
        dimensoes.forEach((dim: string) => {
          selectOptions[dim] = true;
        });

        // 2. Monta os filtros da query (Where)
        const whereOptions: any = {
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        };

        // Se o usuário mandou um status específico no filtro (ex: 'APROVADO' ou 'POSSIBILIDADE'), aplicamos aqui
        if (statusFilter && statusFilter !== 'TODOS') {
          whereOptions.status = statusFilter as StatusAtendimento;
        }

        // 3. Executa a busca no banco
        const prospects = await prisma.prospect.findMany({
          where: whereOptions,
          select: selectOptions,
          orderBy: {
            createdAt: 'desc'
          }
        });

        // 4. Formata a resposta
        const dadosFormatados = prospects.map((item: any) => {
          const row: any = { ...item };
          
          // Trata os arrays (novosModulos) para virar uma string legível na tabela/CSV
          if (row.novosModulos && Array.isArray(row.novosModulos)) {
            row.novosModulos = row.novosModulos.join(', ');
          }

          // Trata datas para o formato local (se o usuário escolheu ver a data)
          if (row.createdAt) {
            row.createdAt = new Date(row.createdAt).toLocaleDateString('pt-BR');
          }

          // Se o usuário pediu a métrica de volume, injeta o número 1
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