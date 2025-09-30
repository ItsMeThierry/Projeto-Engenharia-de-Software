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
    let users_online = [];

    io.on('connection', (socket) => {
  
      socket.on('joined_room', (data) => {
        socket.join(data.room_id);

        const userExists = users_online.some(user => 
          user.room_id === data.room_id && user.username === data.username
        );

        if(!userExists) {
          const user_data = {
            room_id: data.room_id,
            username: data.username,
            socket_id: socket.id
          };
          users_online.push(user_data);
        }

        const users_list = users_online
          .filter(user => user.room_id === data.room_id)
          .map(user => user.username);
        
        io.to(data.room_id).emit('update_rooms', users_list);
      });

      socket.on('left_room', (data) => {
        socket.leave(data.room_id);

        users_online = users_online.filter(user => 
          !(user.room_id === data.room_id && user.username === data.username)
        );

        const users_list = users_online
          .filter(user => user.room_id === data.room_id)
          .map(user => user.username);
        
        io.to(data.room_id).emit('update_rooms', users_list);
      });

      socket.on('disconnect', (reason) => {
        console.log('Usuário desconectado:', socket.id, 'Motivo:', reason);
        
        const disconnectedUser = users_online.find(user => user.socket_id === socket.id);
        
        if (disconnectedUser) {
          users_online = users_online.filter(user => user.socket_id !== socket.id);
          
          const users_list = users_online
            .filter(user => user.room_id === disconnectedUser.room_id)
            .map(user => user.username);
          
          io.to(disconnectedUser.room_id).emit('update_rooms', users_list);
          console.log(`Usuário ${disconnectedUser.username} removido da sala ${disconnectedUser.room_id}`);
        }
      });

      socket.on('send_message', (data) => {
        io.to(data.room_id).emit('recieve_message', data);
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