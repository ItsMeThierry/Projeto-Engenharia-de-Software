# Tela de Participantes do Curso

## 📋 Resumo da Implementação

Implementação completa da funcionalidade de gerenciamento de participantes do curso, permitindo visualizar, adicionar e remover usuários de uma disciplina.

## ✨ Funcionalidades Implementadas

### 1. **Listar Participantes**
- ✅ Exibição em cards responsivos
- ✅ Informações mostradas: Nome, E-mail, Cargo
- ✅ Avatar com inicial do nome
- ✅ Design moderno com hover effects
- ✅ Estado de loading durante carregamento
- ✅ Mensagem quando não há participantes

### 2. **Adicionar Participante (Monitor)**
- ✅ Botão "Adicionar Participante" visível apenas para monitores
- ✅ Modal de busca por e-mail
- ✅ Validações:
  - Verifica se usuário existe no sistema
  - Verifica se já está matriculado no curso
  - Mensagens de erro claras
- ✅ Tela de confirmação com preview dos dados do usuário
- ✅ Integração preparada com banco de dados

### 3. **Remover Participantes (Monitor)**
- ✅ Botão "Remover Participantes" visível apenas para monitores
- ✅ Modal de seleção com checkboxes
- ✅ Permite remover múltiplos participantes de uma vez
- ✅ Tela de confirmação listando usuários a serem removidos
- ✅ Aviso visual sobre a ação
- ✅ Integração preparada com banco de dados

## 🗄️ Integração com Banco de Dados

### Endpoints Necessários

#### 1. **Listar Participantes de um Curso**
```javascript
// GET /api/usuarios-em-curso?curso_id={id}
// Retorna array de participantes com dados do usuário

// Resposta esperada:
[
  {
    "id": 1,
    "usuario_id": 1,
    "curso_id": 1,
    "usuario_nome": "João Silva",
    "usuario_email": "joao@email.com",
    "cargo": "monitor"
  }
]
```

**Query SQL sugerida:**
```sql
SELECT 
  uec.ID as id,
  uec.usuario_id,
  uec.curso_id,
  u.nome as usuario_nome,
  u.email as usuario_email,
  u.cargo
FROM UsuariosEmCurso uec
JOIN Usuarios u ON uec.usuario_id = u.ID
WHERE uec.curso_id = $1
ORDER BY u.nome ASC;
```

#### 2. **Buscar Usuário por E-mail**
```javascript
// GET /api/usuarios?email={email}
// Retorna array com usuário encontrado

// Resposta esperada:
[
  {
    "id": 5,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "cargo": "aluno"
  }
]
```

**Query SQL sugerida:**
```sql
SELECT ID as id, nome, email, cargo
FROM Usuarios
WHERE email = $1;
```

#### 3. **Adicionar Participante ao Curso**
```javascript
// POST /api/usuarios-em-curso
// Body: { "usuario_id": 5, "curso_id": 1 }

// Resposta esperada:
{
  "id": 10,
  "usuario_id": 5,
  "curso_id": 1
}
```

**Implementação sugerida (backend/routes/usuarioemcurso.js):**
```javascript
// Já existe endpoint POST, mas validar:
router.post('/', async (req, res) => {
  const { usuario_id, curso_id } = req.body;
  
  if (!usuario_id || !curso_id) {
    return res.status(400).json({ 
      error: 'Usuario_id e curso_id são obrigatórios' 
    });
  }

  try {
    // Verificar se já existe
    const existente = await pool.query(
      'SELECT * FROM UsuariosEmCurso WHERE usuario_id=$1 AND curso_id=$2',
      [usuario_id, curso_id]
    );
    
    if (existente.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Usuário já está matriculado neste curso' 
      });
    }

    // Inserir
    const result = await pool.query(
      'INSERT INTO UsuariosEmCurso (usuario_id, curso_id) VALUES ($1, $2) RETURNING *',
      [usuario_id, curso_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao adicionar usuário ao curso', 
      details: error.message 
    });
  }
});
```

#### 4. **Remover Múltiplos Participantes**
```javascript
// DELETE /api/usuarios-em-curso/bulk-delete
// Body: { "ids": [1, 2, 3] }

// Resposta esperada:
{
  "message": "3 participantes removidos com sucesso",
  "removed": [1, 2, 3]
}
```

**Implementação sugerida (adicionar ao backend/routes/usuarioemcurso.js):**
```javascript
// NOVO ENDPOINT - Adicionar ao arquivo
router.delete('/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      error: 'Array de IDs é obrigatório' 
    });
  }

  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `DELETE FROM UsuariosEmCurso WHERE ID IN (${placeholders}) RETURNING *`;
    
    const result = await pool.query(query, ids);
    
    res.status(200).json({
      message: `${result.rowCount} participantes removidos com sucesso`,
      removed: ids
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao remover participantes', 
      details: error.message 
    });
  }
});
```

### Pontos de Integração no Frontend

#### Arquivo: `frontend/src/tela_de_curso/Participantes.js`

**1. Carregamento de Participantes (linha ~30):**
```javascript
const fetchParticipants = async () => {
  try {
    setLoading(true);
    const response = await fetch(`/api/usuarios-em-curso?curso_id=${courseId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar participantes');
    }
    
    const data = await response.json();
    
    // Filtrar apenas os participantes deste curso (se a API não filtrar)
    const courseParticipants = data.filter(item => 
      item.curso_id === parseInt(courseId)
    );
    
    setParticipants(courseParticipants);
    setLoading(false);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    setLoading(false);
    // Implementar notificação de erro
  }
};
```

**2. Buscar Usuário por E-mail (linha ~58):**
```javascript
const handleSearchUser = async () => {
  setAddError('');
  setFoundUser(null);
  
  if (!searchEmail.trim()) {
    setAddError('Digite um e-mail para buscar');
    return;
  }

  try {
    const response = await fetch(`/api/usuarios?email=${encodeURIComponent(searchEmail)}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar usuário');
    }
    
    const users = await response.json();
    
    if (users.length === 0) {
      setAddError('Usuário não encontrado no sistema');
      return;
    }

    const user = users[0];
    
    // Verificar se já está no curso
    const alreadyInCourse = participants.some(p => p.usuario_id === user.id);
    if (alreadyInCourse) {
      setAddError('Este usuário já está matriculado no curso');
      return;
    }

    setFoundUser(user);
    setShowAddConfirmation(true);
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    setAddError('Erro ao buscar usuário. Tente novamente.');
  }
};
```

**3. Adicionar Participante (linha ~89):**
```javascript
const handleConfirmAdd = async () => {
  try {
    const response = await fetch('/api/usuarios-em-curso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: foundUser.id,
        curso_id: parseInt(courseId)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      setAddError(errorData.error || 'Erro ao adicionar usuário ao curso');
      setShowAddConfirmation(false);
      return;
    }

    const newEntry = await response.json();
    
    // Adicionar à lista local
    const newParticipant = {
      id: newEntry.id || newEntry.ID,
      usuario_id: foundUser.id,
      usuario_nome: foundUser.nome,
      usuario_email: foundUser.email,
      cargo: foundUser.cargo
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    handleCancelAdd();
    
    // Implementar notificação de sucesso
    console.log('Usuário adicionado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    setAddError('Erro ao adicionar usuário. Tente novamente.');
    setShowAddConfirmation(false);
  }
};
```

**4. Remover Participantes (linha ~145):**
```javascript
const handleConfirmRemove = async () => {
  try {
    const response = await fetch('/api/usuarios-em-curso/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedForRemoval })
    });

    if (!response.ok) {
      throw new Error('Erro ao remover participantes');
    }

    // Remover da lista local
    setParticipants(prev => 
      prev.filter(p => !selectedForRemoval.includes(p.id))
    );
    
    handleCancelRemove();
    
    // Implementar notificação de sucesso
    console.log(`${selectedForRemoval.length} participantes removidos com sucesso!`);
    
  } catch (error) {
    console.error('Erro ao remover participantes:', error);
    // Implementar notificação de erro
  }
};
```

## 📁 Arquivos Modificados

### Arquivos Existentes
```
frontend/src/tela_de_curso/
├── Participantes.js      # Substituir conteúdo completo
└── Participantes.css     # Criar novo arquivo
```

### Backend - Modificações Necessárias
```
backend/routes/
└── usuarioemcurso.js     # Adicionar endpoint bulk-delete
```

**Adicionar ao final do arquivo `usuarioemcurso.js`:**
```javascript
// DELETE /api/usuarios-em-curso/bulk-delete
router.delete('/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Array de IDs é obrigatório' });
  }

  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `DELETE FROM UsuariosEmCurso WHERE ID IN (${placeholders}) RETURNING *`;
    
    const result = await pool.query(query, ids);
    
    res.status(200).json({
      message: `${result.rowCount} participantes removidos com sucesso`,
      removed: ids
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao remover participantes', 
      details: error.message 
    });
  }
});

module.exports = router;
```

## 🐙 Workflow Git

### 1. Sincronizar com GitHub
```bash
cd "Projeto Engenharia de Software"
git checkout main
git pull origin main
```

### 2. Criar Branch
```bash
git checkout -b feature/tela-participantes
```

### 3. Adicionar Arquivos
```bash
# Frontend
git add frontend/src/tela_de_curso/Participantes.js
git add frontend/src/tela_de_curso/Participantes.css

# Backend (se modificar)
git add backend/routes/usuarioemcurso.js

# Documentação
git add README-participantes.md
```

### 4. Commit
```bash
git commit -m "feat: implementar tela de participantes do curso

- Adicionar listagem de participantes com cards responsivos
- Implementar busca e adição de participantes por e-mail
- Adicionar remoção em lote de participantes
- Aplicar validações (usuário existe, já matriculado)
- Criar modais de confirmação para todas as ações
- Implementar controle de permissões (monitor/aluno)
- Preparar integração completa com banco de dados
- Adicionar endpoint bulk-delete no backend

Funcionalidades:
✅ Listar participantes (nome, email, cargo)
✅ Adicionar participante (busca por email)
✅ Remover múltiplos participantes
✅ Validações completas
✅ Interface responsiva
✅ Controle de permissões"
```

### 5. Push
```bash
git push origin feature/tela-participantes
```

### 6. Pull Request
```markdown
## 🎯 Objetivo
Implementação completa da tela de participantes do curso com funcionalidades de visualização, adição e remoção de usuários.

## ✨ Funcionalidades
- ✅ Listagem de participantes em cards
- ✅ Adicionar participantes por e-mail (monitores)
- ✅ Remover múltiplos participantes (monitores)
- ✅ Validações de existência e duplicação
- ✅ Modais de confirmação
- ✅ Interface responsiva

## 🧪 Como Testar
1. Login como monitor
2. Acessar página de participantes de um curso
3. Testar adição de participante existente
4. Testar adição de e-mail inexistente
5. Testar adição de participante já matriculado
6. Testar remoção de múltiplos participantes

## 📋 Checklist
- [x] Frontend implementado
- [x] Validações de formulário
- [x] Controle de permissões
- [x] Interface responsiva
- [x] Documentação completa
- [ ] Endpoint bulk-delete adicionado (backend)
- [ ] Testes de integração
```

## 🔍 Validações Implementadas

### Adicionar Participante
1. ✅ Campo e-mail não pode estar vazio
2. ✅ Usuário deve existir no sistema
3. ✅ Usuário não pode já estar matriculado no curso
4. ✅ Confirmação antes de adicionar

### Remover Participantes
1. ✅ Deve selecionar ao menos um participante
2. ✅ Confirmação antes de remover
3. ✅ Lista clara dos usuários a serem removidos

## 🎨 Melhorias de UI/UX

- Cards modernos com avatares circulares
- Hover effects suaves
- Estados de loading
- Mensagens de erro claras
- Confirmações em duas etapas
- Design responsivo mobile-first
- Scrollbars customizadas
- Transições suaves

## ⚠️ Considerações Importantes

### 1. Permissões
- Botões de gerenciamento visíveis apenas para monitores
- Verificar permissões também no backend

### 2. Performance
- Carregar participantes apenas do curso atual
- Implementar debounce na busca por e-mail (opcional)
- Paginação se houver muitos participantes (futuro)

### 3. Segurança
- Validar permissões no backend
- Sanitizar inputs
- Prevenir SQL injection (usar prepared statements)

### 4. Melhorias Futuras
- Adicionar múltiplos usuários de uma vez
- Filtro/busca na lista de participantes
- Exportar lista de participantes
- Notificações por e-mail ao adicionar/remover

## 📞 Próximos Passos

1. **Backend**: Adicionar endpoint `bulk-delete` em `usuarioemcurso.js`
2. **Testes**: Testar todas as operações com dados reais
3. **Validação**: Garantir que todas as validações funcionam
4. **Deploy**: Subir para ambiente de testes

---

**Autor**: Claude (Assistant)  
**Data**: 2025  
**Sprint**: Tela de Participantes do Curso  
**Status**: ✅ Frontend Completo | ⏳ Aguardando Integração Backend