const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/noticias/     =     Listar todas as notícias
router.get('/', async (req, res) => {
     try {
          const result = await pool.query(`
               SELECT n.ID_noticia, n.titulo, n.texto, n.data_envio,
                      n.curso_id, c.nome AS curso_nome,
                      n.usuario_id, u.nome AS usuario_nome
               FROM Noticias n
               JOIN Cursos c ON n.curso_id = c.ID_curso
               JOIN Usuarios u ON n.usuario_id = u.ID
               ORDER BY n.data_envio DESC
          `);
          res.json(result.rows);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao buscar notícias', details: error.message });
     }
});

// POST /api/noticias     =     Criar uma nova notícia
router.post('/', async (req, res) => {
     const { curso_id, usuario_id, titulo, texto } = req.body;
     if (!curso_id || !usuario_id || !titulo || !texto) {
          return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
     }

     try {
          const result = await pool.query(
               `INSERT INTO Noticias (curso_id, usuario_id, titulo, texto)
                VALUES ($1, $2, $3, $4) RETURNING *`,
               [curso_id, usuario_id, titulo, texto]
          );
          res.status(201).json(result.rows[0]);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao criar notícia', details: error.message });
     }
});

// DELETE /api/noticias/:id     =     Deletar uma notícia pelo ID
router.delete('/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const result = await pool.query(
               'DELETE FROM Noticias WHERE ID_noticia=$1 RETURNING *',
               [id]
          );

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Notícia não encontrada' });
          }

          res.status(200).json({ message: 'Notícia deletada com sucesso', noticia: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao deletar notícia', details: error.message });
     }
});

// PATCH /api/noticias/:id     =     Atualizar uma notícia pelo ID
router.patch('/:id', async (req, res) => {
     const { id } = req.params;
     const { curso_id, usuario_id, titulo, texto } = req.body;

     if (!curso_id && !usuario_id && !titulo && !texto) {
          return res.status(400).json({ error: 'Informe pelo menos um campo para atualizar' });
     }

     try {
          // Construindo query dinâmica
          const fields = [];
          const values = [];
          let idx = 1;

          if (curso_id) {
               fields.push(`curso_id=$${idx++}`);
               values.push(curso_id);
          }
          if (usuario_id) {
               fields.push(`usuario_id=$${idx++}`);
               values.push(usuario_id);
          }
          if (titulo) {
               fields.push(`titulo=$${idx++}`);
               values.push(titulo);
          }
          if (texto) {
               fields.push(`texto=$${idx++}`);
               values.push(texto);
          }

          values.push(id); // WHERE ID_noticia=$n

          const query = `UPDATE Noticias SET ${fields.join(', ')} WHERE ID_noticia=$${idx} RETURNING *`;
          const result = await pool.query(query, values);

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Notícia não encontrada' });
          }

          res.status(200).json({ message: 'Notícia atualizada com sucesso', noticia: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao atualizar notícia', details: error.message });
     }
});

module.exports = router;
