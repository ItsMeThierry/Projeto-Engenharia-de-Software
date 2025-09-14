const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/usuarios-em-curso/     =     Listar todos os registros de usuários em cursos
router.get('/', async (req, res) => {
     try {
          const result = await pool.query(`
               SELECT uec.ID, uec.usuario_id, u.nome AS usuario_nome,
                      uec.curso_id, c.nome AS curso_nome
               FROM UsuariosEmCurso uec
               JOIN Usuarios u ON uec.usuario_id = u.ID
               JOIN Cursos c ON uec.curso_id = c.ID_curso
               ORDER BY uec.ID ASC
          `);
          res.json(result.rows);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao buscar registros', details: error.message });
     }
});

// POST /api/usuarios-em-curso     =     Adicionar um usuário a um curso
router.post('/', async (req, res) => {
     const { usuario_id, curso_id } = req.body;
     if (!usuario_id || !curso_id) {
          return res.status(400).json({ error: 'Usuario_id e curso_id são obrigatórios' });
     }

     try {
          const result = await pool.query(
               'INSERT INTO UsuariosEmCurso (usuario_id, curso_id) VALUES ($1, $2) RETURNING *',
               [usuario_id, curso_id]
          );
          res.status(201).json(result.rows[0]);
     } catch (error) {
          res.status(500).json({ error: 'Erro ao adicionar usuário ao curso', details: error.message });
     }
});

// DELETE /api/usuarios-em-curso/:id     =     Remover um usuário de um curso pelo ID
router.delete('/:id', async (req, res) => {
     const { id } = req.params;

     try {
          const result = await pool.query(
               'DELETE FROM UsuariosEmCurso WHERE ID=$1 RETURNING *',
               [id]
          );

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Registro não encontrado' });
          }

          res.status(200).json({ message: 'Usuário removido do curso com sucesso', registro: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao remover usuário do curso', details: error.message });
     }
});

// PATCH /api/usuarios-em-curso/:id     =     Atualizar usuário ou curso de um registro pelo ID
router.patch('/:id', async (req, res) => {
     const { id } = req.params;
     const { usuario_id, curso_id } = req.body;

     if (!usuario_id && !curso_id) {
          return res.status(400).json({ error: 'Informe pelo menos um campo para atualizar' });
     }

     try {
          const fields = [];
          const values = [];
          let idx = 1;

          if (usuario_id) {
               fields.push(`usuario_id=$${idx++}`);
               values.push(usuario_id);
          }
          if (curso_id) {
               fields.push(`curso_id=$${idx++}`);
               values.push(curso_id);
          }

          values.push(id); // WHERE ID=$n

          const query = `UPDATE UsuariosEmCurso SET ${fields.join(', ')} WHERE ID=$${idx} RETURNING *`;
          const result = await pool.query(query, values);

          if (result.rowCount === 0) {
               return res.status(404).json({ error: 'Registro não encontrado' });
          }

          res.status(200).json({ message: 'Registro atualizado com sucesso', registro: result.rows[0] });
     } catch (error) {
          res.status(500).json({ error: 'Erro ao atualizar registro', details: error.message });
     }
});

module.exports = router;
