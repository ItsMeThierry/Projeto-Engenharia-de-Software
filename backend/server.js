const express = require('express');
const cors = require('cors');
const createTables = require('./db/createTables');

// Caminho das rotas
const usuariosRouter = require('./routes/usuarios');
const cursosRouter = require('./routes/cursos');
const modulosRouter = require('./routes/modulos');
const noticiasRouter = require('./routes/noticias');
const conteudoRouter = require('./routes/conteudo');
const usuariosEmCursoRouter = require('./routes/usuarioemcurso');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/usuarios', usuariosRouter);
app.use('/api/cursos', cursosRouter);
app.use('/api/modulos', modulosRouter);
app.use('/api/noticias', noticiasRouter);
app.use('/api/conteudo', conteudoRouter);
app.use('/api/usuarios-em-curso', usuariosEmCursoRouter);

// Health check / rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'API do Meu Projeto, Tudo OK!' });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    await createTables(); // Criação de todas as tabelas
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();