import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clientes = [];

// Coloque o caminho exato do seu arquivo CSV aqui
const arquivoCSV = './Estabelecimentos.csv'; 

async function importar() {
  console.log('Lendo o arquivo CSV...');

  fs.createReadStream(arquivoCSV)
    // O seu CSV real começa na linha 2, então ignoramos a primeira
    .pipe(csv({ skipLines: 1 })) 
    .on('data', (row) => {
      // Pegamos apenas as linhas que realmente têm um CNPJ válido
      if (row['CNPJ']) {
        clientes.push(row);
      }
    })
    .on('end', async () => {
      console.log(`CSV lido! Encontrados ${clientes.length} clientes. Importando para o banco...`);
      
      let importados = 0;

      for (const cliente of clientes) {
        try {
          await prisma.prospect.create({
            data: {
              cnpj: cliente['CNPJ'],
              nome: cliente['Razão Social'] || cliente['Nome Fantasia'],
              telefone: cliente['Telefone Principal'] || 'Sem Telefone',
              modulosAtuais: 'Nenhum', // Valor padrão, já que não tem na planilha
              status: 'PENDENTE'
            }
          });
          importados++;
        } catch (error) {
          console.error(`Erro ao importar o CNPJ ${cliente['CNPJ']}:`, error.message);
        }
      }

      console.log(`\nImportação concluída! ${importados} clientes adicionados com sucesso.`);
      await prisma.$disconnect();
    });
}

importar();