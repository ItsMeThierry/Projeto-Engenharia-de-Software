const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const createTables = require('./db/createTables');

// Caminho das rotas
const usuariosRouter = require('./routes/usuarios');
const cursosRouter = require('./routes/cursos');
const modulosRouter = require('./routes/modulos');
const noticiasRouter = require('./routes/noticias');
const conteudoRouter = require('./routes/conteudo');
const usuariosEmCursoRouter = require('./routes/usuarioemcurso');
=======
const { Pool } = require('pg');
require('dotenv').config();
>>>>>>> main

// Configuração básica
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware mínimo
app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'usuario',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'meu_projeto_db',
  password: process.env.DB_PASSWORD || 'senha_segura',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão com o banco
pool.on('connect', () => {
  console.log('Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco:', err);
  process.exit(-1);
});

// Middleware para aguardar conexão com o banco
const waitForDatabase = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT NOW()');
      console.log('Banco de dados está disponível!');
      break;
    } catch (err) {
      console.log(`Aguardando banco de dados... tentativas restantes: ${retries}`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (!retries) {
    console.error('Não foi possível conectar ao banco de dados');
    process.exit(1);
  }
};

// 1. Health Check - Verifica se o servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Servidor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// 2. Teste de conexão com PostgreSQL - Verifica se o banco está acessível
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Conexão com PostgreSQL OK!',
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Falha na conexão com PostgreSQL',
      details: error.message
    });
  }
});

// Exemplo de rota para listar usuários
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao buscar usuários',
      details: error.message
    });
  }
});

// Exemplo de rota para criar usuário
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Email já existe' });
    } else {
      res.status(500).json({ 
        error: 'Erro ao criar usuário',
        details: error.message
      });
    }
  }
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Meu Projeto',
    endpoints: {
      health: '/api/health',
      testDb: '/api/test-db',
      users: '/api/users'
    }
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    await waitForDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer();