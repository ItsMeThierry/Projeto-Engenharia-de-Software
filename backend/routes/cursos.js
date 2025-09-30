const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/cursos/     =     Listar todos os cursos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Cursos ORDER BY ID_curso ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cursos', details: error.message });
  }
});

// GET /api/cursos/:id     =     Buscar um curso pelo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM Cursos WHERE ID_curso=$1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar curso', details: error.message });
  }
});

// POST /api/cursos     =      Criar um novo curso
router.post('/', async (req, res) => {
  const { nome, descricao, ID } = req.body;
  if (!nome || !ID) {
    return res.status(400).json({ error: 'O nome do curso e ID do usuário são obrigatórios' });
  }

  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const cursoResult = await client.query(
        'INSERT INTO Cursos (nome, descricao, id_owner) VALUES ($1, $2, $3) RETURNING *',
        [nome, descricao || null, ID]
      );

      const novoCurso = cursoResult.rows[0];

      await client.query(
        'INSERT INTO UsuariosEmCurso (usuario_id, curso_id) VALUES ($1, $2)',
        [ID, novoCurso.id_curso]
      );

      await client.query('COMMIT');
      res.status(201).json(novoCurso);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar curso', details: error.message });
  }
});

// DELETE /api/cursos/:id     =     Deletar um curso pelo ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM Cursos WHERE ID_curso=$1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.status(200).json({ message: 'Curso deletado com sucesso', curso: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar curso', details: error.message });
  }
});

// PATCH /api/cursos/:id     =     Atualizar um curso pelo ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Informe o nome do curso para atualizar' });
  }

  try {
    const result = await pool.query(
      'UPDATE Cursos SET nome=$1 WHERE ID_curso=$2 RETURNING *',
      [nome, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.status(200).json({ message: 'Curso atualizado com sucesso', curso: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar curso', details: error.message });
  }
});

module.exports = router;
