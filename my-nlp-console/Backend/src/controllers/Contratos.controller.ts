import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProspectController {
  
  buscarTodos = async (req: Request, res: Response) => {
    try {
      const lista = await prisma.prospect.findMany();
      res.json(lista);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar dados do banco' });
    }
  };

  importar = async (req: Request, res: Response) => {
    try {
      const { clientes } = req.body;

      if (!clientes || !Array.isArray(clientes)) {
        return res.status(400).json({ error: 'Nenhum cliente enviado pelo CSV.' });
      }

      let importados = 0;

      for (const cliente of clientes) {
        if (!cliente.CNPJ) continue;

        // --- Tratamento do Valor ---
        const valorRaw = cliente['Valor pago'];
        let valorNumerico: number | null = null;
        
        if (valorRaw !== undefined && valorRaw !== null && valorRaw !== '') {
          if (typeof valorRaw === 'number') {
            // Se a biblioteca da planilha já enviou como número (ex: 350.77)
            valorNumerico = valorRaw;
          } else {
            // Se enviou como texto, limpamos com segurança
            let valorString = String(valorRaw).trim();
            
            // Verifica se está no padrão brasileiro (com vírgula)
            if (valorString.includes(',')) {
              // Remove "R$", remove pontos de milhar (com Regex global) e troca vírgula por ponto
              valorString = valorString.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.');
            } else {
              // Se não tem vírgula, já está no padrão americano. Removemos apenas símbolos indesejados.
              valorString = valorString.replace(/R\$\s?/gi, '');
            }
            
            valorNumerico = parseFloat(valorString);
            
            // Se por acaso a conversão falhar (NaN), salva como null para não bugar o banco
            if (isNaN(valorNumerico)) {
              valorNumerico = null;
            }
          }
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
          await prisma.prospect.upsert({
            where: { 
              cnpj: String(cliente.CNPJ) 
            },
            update: {
              nomeFantasia: nomeFantasia,
              endereco: enderecoCompleto !== '' ? enderecoCompleto : null,
              valor: valorNumerico,
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
          importados++;
        } catch (err) {
          console.error(`Erro ao processar o CNPJ ${cliente.CNPJ}:`, err);
        }
      }
      
      req.app.get('io').emit('prospectsRefresh');
      res.status(201).json({ message: `Sucesso! Foram processados ${importados} clientes.` });
      
    } catch (error) {
      console.error("Erro crítico na função importar:", error);
      res.status(500).json({ error: 'Erro ao salvar a planilha' });
    }
  };

  buscarHistorico = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const historico = await prisma.historicoAtendimento.findMany({
        where: { prospectId: id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(historico);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  };

  travar = async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { userName } = req.body; 
      
      const prospectAtual = await prisma.prospect.findUnique({ where: { id } });
      
      if (prospectAtual?.status !== 'PENDENTE') {
        return res.status(409).json({ error: 'Cliente já está em atendimento ou já foi triado' });
      }

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: 'EM_ATENDIMENTO',
          lockedBy: userName 
        }
      });

      await prisma.historicoAtendimento.create({
        data: {
          prospectId: id,
          acao: 'Iniciou o Atendimento',
          usuario: userName,
          novosModulos: [],
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json(atualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao travar cliente' });
    }
  };

  finalizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { acao, observacoes, novosModulos, atendidoPor, nomeFantasia, endereco, valor } = req.body; 

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: { 
          status: acao,
          observacoes, 
          novosModulos,
          atendidoPor,
          nomeFantasia, 
          endereco,
          valor: valor ? parseFloat(valor) : null, // Conversão para Float 
          dataAtendimento: new Date() 
        }
      });

      await prisma.historicoAtendimento.create({
        data: {
          prospectId: id,
          acao: `Finalizou como ${acao}`,
          observacoes,
          novosModulos: novosModulos || [],
          usuario: atendidoPor || 'Sistema'
        }
      });

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: `Atendimento finalizado como ${acao}!`, prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao finalizar atendimento' });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        observacoes, 
        novosModulos, 
        status, 
        usuarioLogado, 
        nomeFantasia, 
        endereco, 
        valor,
        telefone,           // <-- ADICIONADO
        telefoneSecundario, // <-- ADICIONADO
        email               // <-- ADICIONADO
      } = req.body;

      const atualizado = await prisma.prospect.update({
        where: { id },
        data: {
          novosModulos,
          nomeFantasia,
          endereco,
          telefone,          
          telefoneSecundario,
          email,              
          valor: valor ? parseFloat(valor) : null, 
          ...(status && { status }) 
        }
      });

      if ((observacoes && observacoes.trim() !== '') || (novosModulos && novosModulos.length > 0)) {
        await prisma.historicoAtendimento.create({
          data: {
            prospectId: id,
            acao: 'Nova Interação', 
            observacoes: observacoes || null,
            novosModulos: novosModulos || [],
            usuario: usuarioLogado || 'Usuário Desconhecido'
          }
        });
      }

      req.app.get('io').emit('prospectUpdated', atualizado);
      res.json({ message: 'Informações atualizadas com sucesso!', prospect: atualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar atendimento' });
    }
  };
}