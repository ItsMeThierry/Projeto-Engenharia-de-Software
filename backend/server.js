const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
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

    // Criação do server HTTP para o Socket.io
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://frontend:3000'],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Configuração do Socket.io
    io.on('connection', (socket) => {

      socket.on('send_message', (data) => {
        console.log('Mensagem recebida:', data);
        io.emit('recieve_message', data);
      });

      socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
      });
    });

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Socket.io disponível na porta ${PORT}`);
      console.log(`API disponível em: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();