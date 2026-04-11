import { Request, Response } from 'express';
import { PrismaClient, StatusAtendimento } from '@prisma/client';

const prisma = new PrismaClient();

export class RelatorioController {
  
  build = async (req: Request, res: Response): Promise<any> => {
    try {
      // Adicionamos statusFilter para ele poder tirar relatórios só de aprovados, reprovados, etc.
      const { modulo, dataInicial, dataFinal, dimensoes, metricas, statusFilter } = req.body;

      if (!modulo || !dimensoes || dimensoes.length === 0) {
        return res.status(400).json({ error: 'Módulo e pelo menos uma dimensão são obrigatórios.' });
      }

      const startDate = new Date(`${dataInicial}T00:00:00.000Z`);
      const endDate = new Date(`${dataFinal}T23:59:59.999Z`);

      // ==========================================
      // LÓGICA DO MÓDULO: PROSPECTS (CRM)
      // ==========================================
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

        // Se o usuário mandou um status específico no filtro (ex: 'APROVADO'), aplicamos aqui
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
          // (Isso faz com que cada linha da tabela exiba "1" na coluna de volume)
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