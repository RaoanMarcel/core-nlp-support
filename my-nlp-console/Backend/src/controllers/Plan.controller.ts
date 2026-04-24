import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlanController {
  list = async (req: Request, res: Response): Promise<any> => {
    try {
      const { nome } = req.query;
      
      const whereOptions: any = {};
      if (nome) {
        whereOptions.nome = {
          contains: String(nome),
          mode: 'insensitive'
        };
      }

      const plans = await prisma.plan.findMany({
        where: whereOptions,
        orderBy: { createdAt: 'desc' }
      });

      return res.json(plans);
    } catch (error) {
      console.error('Erro ao listar planos:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar planos.' });
    }
  };

  getById = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const plan = await prisma.plan.findUnique({ where: { id } });

      if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });
      
      return res.json(plan);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar o plano.' });
    }
  };

  create = async (req: Request, res: Response): Promise<any> => {
    try {
      const { nome, modulosInclusos, quantidadeUsuarios, descricao, valorBase, percentualPorCnpj } = req.body;

      if (!nome || !valorBase || quantidadeUsuarios === undefined) {
        return res.status(400).json({ error: 'Nome, valor base e quantidade de usuários são obrigatórios.' });
      }

      const newPlan = await prisma.plan.create({
        data: {
          nome,
          modulosInclusos: modulosInclusos || [],
          quantidadeUsuarios: Number(quantidadeUsuarios),
          descricao,
          valorBase: parseFloat(valorBase),
          percentualPorCnpj: parseFloat(percentualPorCnpj || 0)
        }
      });

      return res.status(201).json(newPlan);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      return res.status(500).json({ error: 'Erro interno ao criar o plano.' });
    }
  };

  update = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { nome, modulosInclusos, quantidadeUsuarios, descricao, valorBase, percentualPorCnpj } = req.body;

      const planExists = await prisma.plan.findUnique({ where: { id } });
      if (!planExists) return res.status(404).json({ error: 'Plano não encontrado.' });

      const updatedPlan = await prisma.plan.update({
        where: { id },
        data: {
          nome,
          modulosInclusos,
          quantidadeUsuarios: quantidadeUsuarios !== undefined ? Number(quantidadeUsuarios) : undefined,
          descricao,
          valorBase: valorBase !== undefined ? parseFloat(valorBase) : undefined,
          percentualPorCnpj: percentualPorCnpj !== undefined ? parseFloat(percentualPorCnpj) : undefined
        }
      });

      return res.json(updatedPlan);
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar o plano.' });
    }
  };
}