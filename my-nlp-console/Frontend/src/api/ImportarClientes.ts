// src/pages/api/importar-clientes.ts
import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { clientes } = body;

    let importados = 0;

    for (const cliente of clientes) {
      // Ignora linhas que não tenham o CNPJ
      if (!cliente.CNPJ) continue;

      try {
        // Salva no banco de dados
        await prisma.prospect.create({
          data: {
            cnpj: String(cliente.CNPJ),
            nome: String(cliente['Razão Social'] || cliente['Nome Fantasia'] || 'Sem Nome'),
            telefone: String(cliente['Telefone Principal'] || 'Sem Telefone'),
            modulosAtuais: 'Nenhum',
            status: 'PENDENTE'
          }
        });
        importados++;
      } catch (err) {
        // Se o CNPJ já existir ou der erro em um, ele pula pro próximo sem travar tudo
        console.error(`Erro ao importar o CNPJ ${cliente.CNPJ}`);
      }
    }

    return new Response(JSON.stringify({ success: true, importados }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};