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

// POST /api/modulos     =     Criar um novo módulo (aceita curso_id ou course_name)
router.post('/', async (req, res) => {
    try {
        let { curso_id, course_name, nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'O nome do módulo é obrigatório' });
        }

        // Se curso_id não for fornecido, buscar pelo nome do curso
        if (!curso_id && course_name) {
            const cursoResult = await pool.query(
                'SELECT ID_curso FROM Cursos WHERE nome=$1',
                [course_name]
            );

            if (cursoResult.rowCount === 0) {
                return res.status(404).json({ error: `Curso "${course_name}" não encontrado` });
            }

            curso_id = cursoResult.rows[0].id_curso;
        }

        // Validação final
        if (!curso_id) {
            return res.status(400).json({ error: 'É necessário fornecer curso_id ou course_name válido' });
        }

        // Inserção do módulo
        const result = await pool.query(
            'INSERT INTO Modulos (curso_id, nome, descricao) VALUES ($1, $2, $3) RETURNING *',
            [curso_id, nome, descricao || null]
        );

        res.status(201).json({ message: 'Módulo criado com sucesso', modulo: result.rows[0] });
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
