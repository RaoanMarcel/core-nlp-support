import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configure as variáveis de ambiente no seu .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().then(() => {
  console.log('✅ Conexão SMTP estabelecida com sucesso. Sistema de e-mails pronto!');
}).catch((error) => {
  console.error('❌ ERRO CRÍTICO NO SMTP: Falha ao conectar no servidor de e-mail. Verifique o .env', error);
});

export const enviarPropostaEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const { emailDestino, texto, usuarioId, nomeUsuario } = req.body;

    if (!emailDestino || !texto) {
      return res.status(400).json({ error: 'E-mail e texto são obrigatórios.' });
    }

    await transporter.sendMail({
      from: `"Seu Comercial" <${process.env.SMTP_USER}>`,
      to: emailDestino,
      subject: 'Proposta Comercial',
      text: texto, 
    });

    await prisma.$transaction([
      prisma.quote.update({
        where: { id: Number(id) },
        data: { status: 'ENVIADO' }
      }),
      prisma.quoteHistory.create({
        data: {
          quoteId: Number(id),
          acao: `Proposta Enviada via E-mail para: ${emailDestino}`,
          usuario: nomeUsuario || 'Sistema',
        }
      })
    ]);

    return res.status(200).json({ message: 'E-mail enviado e status atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Erro interno ao disparar e-mail.' });
  }
};