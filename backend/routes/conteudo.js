const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/conteudo/     =     Listar todos os conteúdos
router.get('/', async (req, res) => {
     try {
          const result = await pool.query(`
               SELECT c.ID, c.nome, c.link, c.modulo_id, m.nome AS modulo_nome, m.curso_id
               FROM Conteudo c
               JOIN Modulos m ON c.modulo_id = m.ID_modulo
               ORDER BY c.ID ASC
          `);
          res.json(result.rows);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao buscar conteúdos', details: error.message });
     }
});

// POST /api/conteudo     =     Criar um novo conteúdo
router.post('/', async (req, res) => {
     const { modulo_id, nome, link } = req.body;
     if (!modulo_id || !nome || !link) {
          return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
     }

     try {
          const result = await pool.query(
               'INSERT INTO Conteudo (modulo_id, nome, link) VALUES ($1, $2, $3) RETURNING *',
               [modulo_id, nome, link]
          );
          res.status(201).json(result.rows[0]);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao criar conteúdo', details: error.message });
     }
});

// DELETE /api/conteudo/:id     =     Deletar um conteúdo pelo ID
router.delete('/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const result = await pool.query(
               'DELETE FROM Conteudo WHERE ID=$1 RETURNING *',
               [id]
          );

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Conteúdo não encontrado' });
          }

          res.status(200).json({ message: 'Conteúdo deletado com sucesso', conteudo: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao deletar conteúdo', details: error.message });
     }
});

// PATCH /api/conteudo/:id     =     Atualizar um conteúdo pelo ID
router.patch('/:id', async (req, res) => {
     const { id } = req.params;
     const { modulo_id, nome, link } = req.body;

     if (!modulo_id && !nome && !link) {
          return res.status(400).json({ error: 'Informe pelo menos um campo para atualizar' });
     }

     try {
          const fields = [];
          const values = [];
          let idx = 1;

          if (modulo_id) {
               fields.push(`modulo_id=$${idx++}`);
               values.push(modulo_id);
          }
          if (nome) {
               fields.push(`nome=$${idx++}`);
               values.push(nome);
          }
          if (link) {
               fields.push(`link=$${idx++}`);
               values.push(link);
          }

          values.push(id); // WHERE ID=$n

          const query = `UPDATE Conteudo SET ${fields.join(', ')} WHERE ID=$${idx} RETURNING *`;
          const result = await pool.query(query, values);

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Conteúdo não encontrado' });
          }

          res.status(200).json({ message: 'Conteúdo atualizado com sucesso', conteudo: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao atualizar conteúdo', details: error.message });
     }
});

module.exports = router;
