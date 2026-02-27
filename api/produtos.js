// api/produtos.js - Versão com Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Conectar ao Neon
    const sql = neon(process.env.DATABASE_URL);

    try {
        // GET - Listar todos os produtos
        if (req.method === 'GET') {
            const produtos = await sql`
                SELECT * FROM produtos 
                ORDER BY created_at DESC
            `;
            return res.status(200).json(produtos);
        }
        
        // POST - Adicionar novo produto
        else if (req.method === 'POST') {
            const { senha, ...produto } = req.body;
            
            if (senha !== 'shekinah2026') {
                return res.status(401).json({ erro: 'Não autorizado' });
            }

            const id = Date.now().toString();
            
            const result = await sql`
                INSERT INTO produtos (
                    id, category, title, description, price, tags, sku
                ) VALUES (
                    ${id}, 
                    ${produto.category}, 
                    ${produto.title}, 
                    ${produto.description}, 
                    ${produto.price}, 
                    ${produto.tags}, 
                    ${produto.sku}
                )
                RETURNING *
            `;
            
            return res.status(201).json(result[0]);
        }
        
        // PUT - Atualizar produto
        else if (req.method === 'PUT') {
            const { senha, id, ...produto } = req.body;
            
            if (senha !== 'shekinah2026') {
                return res.status(401).json({ erro: 'Não autorizado' });
            }

            const result = await sql`
                UPDATE produtos 
                SET 
                    category = ${produto.category},
                    title = ${produto.title},
                    description = ${produto.description},
                    price = ${produto.price},
                    tags = ${produto.tags},
                    sku = ${produto.sku}
                WHERE id = ${id}
                RETURNING *
            `;
            
            if (result.length === 0) {
                return res.status(404).json({ erro: 'Produto não encontrado' });
            }
            
            return res.status(200).json(result[0]);
        }
        
        // DELETE - Remover produto
        else if (req.method === 'DELETE') {
            const { senha, id } = req.body;
            
            if (senha !== 'shekinah2026') {
                return res.status(401).json({ erro: 'Não autorizado' });
            }

            const result = await sql`
                DELETE FROM produtos 
                WHERE id = ${id}
                RETURNING id
            `;
            
            if (result.length === 0) {
                return res.status(404).json({ erro: 'Produto não encontrado' });
            }
            
            return res.status(200).json({ mensagem: 'Produto removido com sucesso' });
        }
        
        else {
            return res.status(405).json({ erro: 'Método não permitido' });
        }

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ 
            erro: 'Erro interno do servidor',
            detalhes: error.message 
        });
    }
}
