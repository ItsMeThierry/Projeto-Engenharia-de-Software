const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/modulos/     =     Listar todos os módulos
router.get('/', async (req, res) => {
     try {
          const result = await pool.query(`
               SELECT m.ID_modulo, m.nome, m.descricao, m.curso_id, c.nome AS curso_nome
               FROM Modulos m
               JOIN Cursos c ON m.curso_id = c.ID_curso
               ORDER BY m.ID_modulo ASC
          `);
          res.json(result.rows);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao buscar módulos', details: error.message });
     }
});

// POST /api/modulos     =     Criar um novo módulo
router.post('/', async (req, res) => {
     const { curso_id, nome, descricao } = req.body;
     if (!curso_id || !nome) {
          return res.status(400).json({ error: 'O curso e o nome do módulo são obrigatórios' });
     }

     try {
          const result = await pool.query(
               'INSERT INTO Modulos (curso_id, nome, descricao) VALUES ($1, $2, $3) RETURNING *',
               [curso_id, nome, descricao || null]
          );
          res.status(201).json(result.rows[0]);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao criar módulo', details: error.message });
     }
});

// DELETE /api/modulos/:id     =     Deletar um módulo pelo ID
router.delete('/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const result = await pool.query(
               'DELETE FROM Modulos WHERE ID_modulo=$1 RETURNING *',
               [id]
          );

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Módulo não encontrado' });
          }

          res.status(200).json({ message: 'Módulo deletado com sucesso', modulo: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao deletar módulo', details: error.message });
     }
});

// PATCH /api/modulos/:id     =     Atualizar um módulo pelo ID
router.patch('/:id', async (req, res) => {
     const { id } = req.params;
     const { curso_id, nome, descricao } = req.body;

     if (!curso_id && !nome && !descricao) {
          return res.status(400).json({ error: 'Informe pelo menos um campo para atualizar' });
     }

     try {
          const fields = [];
          const values = [];
          let idx = 1;

          if (curso_id) {
               fields.push(`curso_id=$${idx++}`);
               values.push(curso_id);
          }
          if (nome) {
               fields.push(`nome=$${idx++}`);
               values.push(nome);
          }
          if (descricao) {
               fields.push(`descricao=$${idx++}`);
               values.push(descricao);
          }

          values.push(id); // WHERE ID_modulo=$n

          const query = `UPDATE Modulos SET ${fields.join(', ')} WHERE ID_modulo=$${idx} RETURNING *`;
          const result = await pool.query(query, values);

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Módulo não encontrado' });
          }

          res.status(200).json({ message: 'Módulo atualizado com sucesso', modulo: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao atualizar módulo', details: error.message });
     }
});

module.exports = router;
