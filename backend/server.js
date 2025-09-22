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
        const room = users_online.find(r => r.room_id === data.room_id);

        if(room){
          if(room.users_id.find(id => id !== data.user_id)){
            room.users_id.push(data.user_id);
          }
        } else {
          const room_data = {
            room_id: data.room_id,
            users_id: [data.user_id]
          };

          users_online.push(room_data);
        }
        console.log(users_online);

        const users_list = users_online.find(room => room.room_id === data.room_id).users_id;
        socket.emit('update_rooms', users_list);
      });

      socket.on('left_room', (data) => {
        let room = users_online.find(r => r.room_id === data.room_id);  
        
        if(room) {
          room.users_id = room.users_id.filter(id => id !== data.user_id);

          if(room.users_id.length === 0){
            users_online = users_online.filter(r => r.room_id !== data.room_id);
          }
        }
        console.log(users_online);

        socket.emit('update_rooms', users_list);
      });

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