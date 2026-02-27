// api/categorias.js
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // GET - Listar categorias
        if (req.method === 'GET') {
            const categorias = await sql`
                SELECT * FROM categorias 
                ORDER BY nome ASC
            `;
            return res.status(200).json(categorias);
        }
        
        // POST - Adicionar categoria
        else if (req.method === 'POST') {
            const { senha, nome } = req.body;
            
            if (senha !== 'shekinah2026') {
                return res.status(401).json({ erro: 'Não autorizado' });
            }

            const id = Date.now().toString();
            
            const result = await sql`
                INSERT INTO categorias (id, nome)
                VALUES (${id}, ${nome})
                RETURNING *
            `;
            
            return res.status(201).json(result[0]);
        }
        
        // DELETE - Remover categoria
        else if (req.method === 'DELETE') {
            const { senha, id } = req.body;
            
            if (senha !== 'shekinah2026') {
                return res.status(401).json({ erro: 'Não autorizado' });
            }

            // Verificar se existem produtos usando esta categoria
            const categoria = await sql`
                SELECT nome FROM categorias WHERE id = ${id}
            `;
            
            if (categoria.length > 0) {
                const produtos = await sql`
                    SELECT COUNT(*) as count FROM produtos 
                    WHERE category = ${categoria[0].nome}
                `;
                
                if (produtos[0].count > 0) {
                    return res.status(400).json({ 
                        erro: 'Existem produtos usando esta categoria' 
                    });
                }
            }

            const result = await sql`
                DELETE FROM categorias 
                WHERE id = ${id}
                RETURNING id
            `;
            
            if (result.length === 0) {
                return res.status(404).json({ erro: 'Categoria não encontrada' });
            }
            
            return res.status(200).json({ mensagem: 'Categoria removida' });
        }
        
        else {
            return res.status(405).json({ erro: 'Método não permitido' });
        }

    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ erro: 'Erro interno' });
    }
}
