const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET /api/noticias/     =     Listar TODAS as notícias
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

// GET /api/noticias/:id     =     Retorna uma notícia pelo ID da notícia
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT n.ID_noticia, n.titulo, n.texto, n.data_envio, n.curso_id, c.nome AS curso_nome, n.usuario_id, u.nome AS usuario_nome ' +
            'FROM Noticias n ' +
            'JOIN Cursos c ON n.curso_id = c.ID_curso ' +
            'JOIN Usuarios u ON n.usuario_id = u.ID ' +
            'WHERE n.ID_noticia=$1',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Notícia não encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notícia', details: error.message });
    }
});

// GET /api/noticias/curso     =     Buscar todas as notícias de um curso pelo ID ou nome
router.get('/curso', async (req, res) => {
    try {
        let { curso_id, course_name } = req.query;

        // Se for passado apenas o nome do curso, buscamos o ID
        if (!curso_id && course_name) {
            const cursoResult = await pool.query(
                'SELECT ID_curso FROM Cursos WHERE nome=$1',
                [course_name]
            );
            if (cursoResult.rowCount === 0) {
                return res.status(404).json({ error: 'Curso não encontrado' });
            }
            curso_id = cursoResult.rows[0].id_curso;
        }

        if (!curso_id) {
            return res.status(400).json({ error: 'Informe curso_id ou course_name' });
        }

        const result = await pool.query(
            `SELECT n.ID_noticia, n.titulo, n.texto, n.data_envio,
                    n.curso_id, c.nome AS curso_nome,
                    n.usuario_id, u.nome AS usuario_nome
             FROM Noticias n
             JOIN Cursos c ON n.curso_id = c.ID_curso
             JOIN Usuarios u ON n.usuario_id = u.ID
             WHERE n.curso_id = $1
             ORDER BY n.data_envio DESC`,
            [curso_id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notícias do curso', details: error.message });
    }
});



// POST /api/noticias/     =     Criar uma nova notícia (aceita IDs ou nomes dos cursos e usuários)
router.post('/', async (req, res) => {
    try {
        let { titulo, texto, curso_id, usuario_id, owner, course_name, title, text } = req.body;

        // Normalizar nomes alternativos
        titulo = titulo || title;
        texto = texto || text;

        if (!titulo || !texto) {
            return res.status(400).json({ error: 'Título e texto são obrigatórios' });
        }

        // Caso curso_id não seja informado, buscar pelo nome
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

        // Caso usuario_id não seja informado, buscar pelo nome
        if (!usuario_id && owner) {
            const usuarioResult = await pool.query(
                'SELECT ID FROM Usuarios WHERE nome=$1',
                [owner]
            );

            if (usuarioResult.rowCount === 0) {
                return res.status(404).json({ error: `Usuário "${owner}" não encontrado` });
            } else if (usuarioResult.rowCount > 1) {
                return res.status(400).json({ 
                    error: `Mais de um usuário encontrado com o nome "${owner}". Use usuario_id para especificar.` 
                });
            }

            usuario_id = usuarioResult.rows[0].id;
        }

        // Validação final
        if (!curso_id || !usuario_id) {
            return res.status(400).json({
                error: 'É necessário fornecer curso_id e usuario_id, ou nomes válidos (course_name, owner).'
            });
        }

        // Inserção
        const result = await pool.query(
            `INSERT INTO Noticias (curso_id, usuario_id, titulo, texto, data_envio)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [curso_id, usuario_id, titulo, texto]
        );

        return res.status(201).json({
            message: 'Notícia criada com sucesso',
            noticia: result.rows[0]
        });

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
