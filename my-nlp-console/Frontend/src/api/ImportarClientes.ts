import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { clientes } = body;

    let importados = 0;
    let atualizados = 0;

    for (const cliente of clientes) {
      if (!cliente.CNPJ) continue;
      const valorRaw = cliente['Valor pago'];
      let valorNumerico: number | null = null;
      
      if (valorRaw) {
        const valorLimpo = String(valorRaw).replace('R$', '').replace('.', '').replace(',', '.').trim();
        valorNumerico = parseFloat(valorLimpo);
      }

      const wleStr = cliente['AR (Clientes WLE)'] ? String(cliente['AR (Clientes WLE)']) : '';
      const isWLE = wleStr.trim().toLowerCase() === 'sim';

      const nomeFantasia = cliente['Nome Fantasia'] ? String(cliente['Nome Fantasia']) : null;

      const logradouro = cliente['Logradouro'] || '';
      const numero = cliente['Número'] || 'S/N';
      const compRaw = cliente['Complemento'];
      const complemento = compRaw && compRaw !== '-' ? ` - ${compRaw}` : '';
      const bairro = cliente['Bairro'] || '';
      const cidade = cliente['Cidade'] || '';
      const estado = cliente['Estado'] || '';
      const cep = cliente['CEP'] || '';

      const enderecoCompleto = `${logradouro}, ${numero}${complemento} - ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`
        .replace(/^[,\s\-]+|[,\s\-]+$/g, '') 
        .trim();

      try {
        const result = await prisma.prospect.upsert({
          where: { 
            cnpj: String(cliente.CNPJ) 
          },
          update: {
            nomeFantasia: nomeFantasia,
            endereco: enderecoCompleto !== '' ? enderecoCompleto : null,
            valor: valorNumerico, // Atualiza o valor se o cliente já existir
          },
          create: {
            cnpj: String(cliente.CNPJ),
            nome: String(cliente['Razão Social'] || cliente['Nome Fantasia'] || 'Sem Nome'),
            nomeFantasia: nomeFantasia,
            endereco: enderecoCompleto !== '' ? enderecoCompleto : null,
            telefone: String(cliente['Telefone Principal'] || 'Sem Telefone'),
            modulosAtuais: 'Nenhum',
            status: 'PENDENTE',
            clienteWLE: isWLE,
            valor: valorNumerico
          }
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          importados++;
        } else {
          atualizados++;
        }

      } catch (err) {
        console.error(`Erro ao processar o CNPJ ${cliente.CNPJ}`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, importados, atualizados }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};