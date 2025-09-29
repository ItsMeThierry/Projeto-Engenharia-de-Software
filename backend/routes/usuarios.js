const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/usuarios/     =     Listar todos os usuários  
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM Usuarios');
  res.json(result.rows);
});

// GET /api/usuarios/verify     =     Verifica se existe um usuário com Nome e Email
router.get('/verify', async (req, res) => {
  const { nome, email } = req.query;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM Usuarios WHERE nome = $1 AND email = $2)',
      [nome, email]
    );

    res.json({ exists: result.rows[0].exists });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar usuário', details: error.message });
  }
});

// GET /api/usuarios/:identifier     =     Buscar usuário por id ou email
router.get('/:identifier', async (req, res) => {
  const { identifier } = req.params;
  
  try {
    // Verifica se o identifier é um número (ID) ou string (email)
    const isId = !isNaN(identifier);
    
    let query;
    let params;

    if (isId) {
      // Busca por ID
      query = 'SELECT * FROM Usuarios WHERE id = $1';
      params = [identifier];
    } else {
      // Busca por email
      query = 'SELECT * FROM Usuarios WHERE email = $1';
      params = [identifier];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
  }
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
