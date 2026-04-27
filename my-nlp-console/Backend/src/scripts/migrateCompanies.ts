import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🚀 Iniciando a migração de empresas...\n');

  try {

    console.log('Buscando Orçamentos...');
    const quotes = await prisma.quote.findMany({
      where: { companyId: null },
    });

    console.log(`Encontrados ${quotes.length} orçamentos para verificar.`);

    for (const quote of quotes) {
      if (!quote.cnpj) continue; 

      const company = await prisma.company.upsert({
        where: { cnpj: quote.cnpj },
        update: {}, 
        create: {
          cnpj: quote.cnpj,
          razaoSocial: quote.nomeCliente,
          email: quote.email,
          telefonePrincipal: quote.telefonePrincipal,
          telefoneSecundario: quote.telefoneSecundario,
          cep: quote.cep,
          logradouro: quote.logradouro,
          numero: quote.numero,
          complemento: quote.complemento,
          bairro: quote.bairro,
          cidade: quote.cidade,
          uf: quote.uf,
        },
      });

      await prisma.quote.update({
        where: { id: quote.id },
        data: { companyId: company.id },
      });

      console.log(` Orçamento #${quote.id} vinculado à empresa ${company.razaoSocial}`);
    }

    console.log('\nBuscando Prospects...');
    const prospects = await prisma.prospect.findMany({
      where: { companyId: null },
    });

    console.log(`Encontrados ${prospects.length} prospects para verificar.`);

    for (const prospect of prospects) {
      if (!prospect.cnpj) continue;

      const company = await prisma.company.upsert({
        where: { cnpj: prospect.cnpj },
        update: {}, 
        create: {
          cnpj: prospect.cnpj,
          razaoSocial: prospect.nome, 
          nomeFantasia: prospect.nomeFantasia,
          email: prospect.email,
          telefonePrincipal: prospect.telefone,
          telefoneSecundario: prospect.telefoneSecundario,
          cep: prospect.cep,
          logradouro: prospect.endereco, 
          bairro: prospect.bairro,
          cidade: prospect.cidade,
          uf: prospect.estado,
        },
      });

      await prisma.prospect.update({
        where: { id: prospect.id },
        data: { companyId: company.id },
      });

      console.log(`Prospect ${prospect.id} vinculado à empresa ${company.razaoSocial}`);
    }

    console.log('\nMigração concluída com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();