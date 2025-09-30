const pool = require('./index');

const createTables = async () => {
  console.log('Ok');
  try {
    // Usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Usuarios (
        ID SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        cargo VARCHAR(50) NOT NULL
      );
    `);

    // Cursos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Cursos (
        ID_curso SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        id_owner INT NOT NULL,
        FOREIGN KEY (id_owner) REFERENCES Usuarios(ID) ON DELETE CASCADE
      );
    `);

    // Módulos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Modulos (
        ID_modulo SERIAL PRIMARY KEY,
        curso_id INT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        FOREIGN KEY (curso_id) REFERENCES Cursos(ID_curso) ON DELETE CASCADE
      );
    `);

    // Usuários em cursos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS UsuariosEmCurso (
        ID SERIAL PRIMARY KEY,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(ID) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES Cursos(ID_curso) ON DELETE CASCADE
      );
    `);

    // Notícias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Noticias (
        ID_noticia SERIAL PRIMARY KEY,
        curso_id INT NOT NULL,
        usuario_id INT NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        texto TEXT,
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (curso_id) REFERENCES Cursos(ID_curso) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(ID) ON DELETE CASCADE
      );
    `);

    // Conteúdos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Conteudo (
        ID SERIAL PRIMARY KEY,
        modulo_id INT NOT NULL,
        nome VARCHAR(100) NOT NULL,
        link TEXT NOT NULL,
        FOREIGN KEY (modulo_id) REFERENCES Modulos(ID_modulo) ON DELETE CASCADE
      );
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
};

module.exports = createTables;
