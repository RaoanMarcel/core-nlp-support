import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyController {

static async getAll(req: Request, res: Response) {
  try {
    const { termo, status, page = 1, limit = 15 } = req.query;

    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;

    const where: any = {};

    if (status === 'ATIVOS') where.ativo = true;
    if (status === 'INATIVOS') where.ativo = false;

    if (termo) {
      where.OR = [
        { razaoSocial: { contains: String(termo), mode: 'insensitive' } },
        { nomeFantasia: { contains: String(termo), mode: 'insensitive' } },
        { cnpj: { contains: String(termo), mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        orderBy: { razaoSocial: 'asc' },
        skip: skip,
        take: l,
        include: {
          _count: {
            select: { quotes: true, prospects: true }
          }
        }
      }),
      prisma.company.count({ where })
    ]);

    return res.status(200).json({
      data: companies,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    });

  } catch (error) {
    console.error("Erro no Controller de Empresas:", error);
    return res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
}

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          quotes: true,    
          prospects: true, 
        }
      });

      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada.' });
      }

      return res.status(200).json(company);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar a empresa.' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = req.body;

      const companyExists = await prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (companyExists) {
        return res.status(400).json({ error: 'Já existe uma empresa com este CNPJ.' });
      }

      const company = await prisma.company.create({
        data,
      });

      return res.status(201).json(company);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar a empresa.' });
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const data = req.body;

      const company = await prisma.company.update({
        where: { id },
        data,
      });

      return res.status(200).json(company);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar a empresa.' });
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const company = await prisma.company.update({
        where: { id },
        data: { ativo: false },
      });

      return res.status(200).json({ message: 'Empresa desativada com sucesso.', company });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao desativar a empresa.' });
    }
  }
}