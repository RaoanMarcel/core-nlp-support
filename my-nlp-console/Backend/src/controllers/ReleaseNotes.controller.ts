import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ReleaseNotesController {
  async index(req: Request, res: Response) {
    try {
      const notes = await prisma.releaseNote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      
      return res.json(notes);
    } catch (error) {
      console.error("Erro ao buscar release notes:", error);
      return res.status(500).json({ error: 'Erro interno ao buscar as novidades.' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { versao, titulo, descricao, categoria } = req.body;

      if (!versao || !titulo || !descricao || !categoria) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      }

      const novaRelease = await prisma.releaseNote.create({
        data: {
          versao,
          titulo,
          descricao,
          categoria
        }
      });

      return res.status(201).json(novaRelease);
    } catch (error) {
      console.error("Erro ao criar release note:", error);
      return res.status(500).json({ error: 'Erro interno ao salvar a novidade.' });
    }
  }
}