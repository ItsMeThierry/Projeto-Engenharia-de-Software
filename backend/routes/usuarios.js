const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/usuarios/     =     Listar todos os usuários  
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM Usuarios');
  res.json(result.rows);
});

// POST /api/usuarios    =     Criar um novo usuário
router.post('/', async (req, res) => {
  const { nome, email, cargo } = req.body;
  if (!nome || !email || !cargo) {
    return res.status(400).json({ error: 'Nome, email e cargo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Usuarios (nome, email, cargo) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Restrição de unicidade violada
      res.status(400).json({ error: 'Email já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
    }
  }
});

// DELETE /api/usuarios/:id     =     Deletar um usuário pelo ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM Usuarios WHERE ID=$1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Usuário deletado com sucesso', usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário', details: error.message });
  }
});

// PATCH /api/usuarios/:id     =     Atualizar um usuário pelo ID
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, cargo } = req.body;

  // Verifica se há algo para atualizar
  if (!nome && !email && !cargo) {
    return res.status(400).json({ error: 'Informe um parâmetro para atualizar' });
  }

  try {
    // Construindo query dinâmica
    const fields = [];
    const values = [];
    let idx = 1;

    if (nome) {
      fields.push(`nome=$${idx++}`);
      values.push(nome);
    }
    if (email) {
      fields.push(`email=$${idx++}`);
      values.push(email);
    }
    if (cargo) {
      fields.push(`cargo=$${idx++}`);
      values.push(cargo);
    }

    values.push(id); // Para WHERE ID=$n

    const query = `UPDATE Usuarios SET ${fields.join(', ')} WHERE ID=$${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Usuário atualizado com sucesso', usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Restrição de unicidade violada (email)
      res.status(400).json({ error: 'Email já existe' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
    }
  }
});

module.exports = router;
