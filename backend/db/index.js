const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'usuario',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'meu_projeto_db',
  password: process.env.DB_PASSWORD || 'senha_segura',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => console.log('Conectado ao PostgreSQL'));
pool.on('error', err => console.error('Erro no Postgres:', err));

module.exports = pool;
