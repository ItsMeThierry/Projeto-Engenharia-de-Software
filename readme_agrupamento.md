# Sistema de Agrupamento de Arquivos

## 📋 Resumo da Implementação

Este documento descreve a implementação do sistema de agrupamento de arquivos para a plataforma de ensino, permitindo que monitores organizem materiais didáticos em grupos categorizados.

## ✨ Funcionalidades Implementadas

### 1. **Criar Grupos de Arquivos**
- **Interface**: Botão "Criar Grupo" na parte superior da página Arquivos
- **Modal**: Formulário com campos para nome e descrição do grupo
- **Validação**: Campos obrigatórios com mensagens de erro
- **Permissão**: Disponível apenas para usuários com `user_type === 'monitor'`

### 2. **Editar Grupos Existentes**
- **Interface**: Ícone de edição no cabeçalho de cada grupo
- **Funcionalidade**: Modal pré-preenchido com dados existentes
- **Validação**: Mesma validação da criação
- **Permissão**: Restrito a monitores

### 3. **Remover Grupos**
- **Seleção**: Modal com checkboxes para escolher grupos
- **Confirmação Dupla**: 
  1. Seleção dos grupos a remover
  2. Confirmação final com lista dos grupos selecionados
- **Segurança**: Aviso sobre ação irreversível
- **Permissão**: Apenas monitores

## 🛠 Arquivos Modificados

### Frontend
```
frontend/src/tela_de_curso/
├── Arquivos.js          # Componente principal com nova lógica
├── Arquivos.css         # Estilos atualizados com novos componentes
└── ../icones/editar.svg # Novo ícone para edição (a ser criado)
```

### Estrutura de Dados (Estado Local)
```javascript
const [groups, setGroups] = useState([
  {
    id: 1,
    title: 'Nome do Grupo',
    description: 'Descrição do grupo',
    contents: [
      { id: 1, name: "Arquivo.pdf", type: "pdf", size: "3 MB" }
    ]
  }
]);
```

## 🗄️ Integração com Banco de Dados

### Tabela Sugerida: `grupos_arquivos`
```sql
CREATE TABLE IF NOT EXISTS grupos_arquivos (
  id SERIAL PRIMARY KEY,
  curso_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criado_por INT NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES Cursos(ID_curso) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES Usuarios(ID) ON DELETE CASCADE
);
```

### Modificação na Tabela `Conteudo`
```sql
-- Adicionar coluna para referenciar o grupo
ALTER TABLE Conteudo 
ADD COLUMN grupo_id INT,
ADD FOREIGN KEY (grupo_id) REFERENCES grupos_arquivos(id) ON DELETE SET NULL;
```

### Endpoints Necessários (Backend)

#### 1. **Listar Grupos de um Curso**
```javascript
// GET /api/grupos-arquivos/curso/:curso_id
// Retorna todos os grupos de um curso específico com seus arquivos
```

#### 2. **Criar Novo Grupo**
```javascript
// POST /api/grupos-arquivos
// Body: { curso_id, nome, descricao, criado_por }
```

#### 3. **Atualizar Grupo**
```javascript
// PATCH /api/grupos-arquivos/:id
// Body: { nome?, descricao? }
```

#### 4. **Remover Grupos**
```javascript
// DELETE /api/grupos-arquivos
// Body: { ids: [1, 2, 3] } // Array de IDs para remoção em lote
```

### Pontos de Integração no Frontend

#### Arquivo: `frontend/src/tela_de_curso/Arquivos.js`

**1. Carregamento de Dados (substituir estado mockado):**
```javascript
// Localizar linha ~15 e substituir por:
useEffect(() => {
  const fetchGroups = async () => {
    try {
      const response = await fetch(`/api/grupos-arquivos/curso/${courseId}`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };
  
  fetchGroups();
}, [courseId]);
```

**2. Criação de Grupo (linha ~47):**
```javascript
const handleCreateGroup = async (groupData) => {
  try {
    const response = await fetch('/api/grupos-arquivos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curso_id: courseId,
        nome: groupData.title,
        descricao: groupData.description,
        criado_por: user_id
      })
    });
    
    if (response.ok) {
      const newGroup = await response.json();
      setGroups(prev => [...prev, {
        id: newGroup.id,
        title: newGroup.nome,
        description: newGroup.descricao,
        contents: []
      }]);
      setShowCreateModal(false);
    }
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    // Implementar notificação de erro
  }
};
```

**3. Atualização de Grupo (linha ~64):**
```javascript
const handleUpdateGroup = async (groupData) => {
  try {
    const response = await fetch(`/api/grupos-arquivos/${editingGroup.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: groupData.title,
        descricao: groupData.description
      })
    });
    
    if (response.ok) {
      setGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, title: groupData.title, description: groupData.description }
          : group
      ));
      setShowEditModal(false);
      setEditingGroup(null);
    }
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
  }
};
```

**4. Remoção de Grupos (linha ~108):**
```javascript
const handleConfirmRemove = async () => {
  try {
    const response = await fetch('/api/grupos-arquivos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedForRemoval })
    });
    
    if (response.ok) {
      setGroups(prev => prev.filter(group => !selectedForRemoval.includes(group.id)));
      setShowRemoveConfirmation(false);
      setGroupsToRemove([]);
      setSelectedForRemoval([]);
    }
  } catch (error) {
    console.error('Erro ao remover grupos:', error);
  }
};
```

## 🐙 Integração com GitHub

### 1. **Criação de Branch**
```bash
# Criar branch específica para a feature
git checkout -b feature/agrupamento-arquivos

# Adicionar arquivos modificados
git add frontend/src/tela_de_curso/Arquivos.js
git add frontend/src/tela_de_curso/Arquivos.css
git add frontend/src/icones/editar.svg

# Commit das mudanças
git commit -m "feat: implementar sistema de agrupamento de arquivos

- Adicionar funcionalidade de criar grupos de arquivos
- Implementar edição de grupos existentes
- Adicionar sistema de remoção com confirmação dupla
- Aplicar controle de permissões para monitores
- Criar interfaces responsivas e acessíveis
- Preparar pontos de integração com backend"
```

### 2. **Pull Request**
```markdown
## 🎯 Objetivo
Implementação do sistema de agrupamento de arquivos conforme solicitado na task.

## ✅ Checklist de Funcionalidades
- [x] Criar grupos de arquivos
- [x] Editar grupos existentes
- [x] Remover grupos com confirmação
- [x] Controle de permissões (monitores apenas)
- [x] Interface responsiva
- [x] Validação de formulários

## 🧪 Como Testar
1. Fazer login como monitor
2. Navegar para página de Arquivos de um curso
3. Testar criação de novo grupo
4. Testar edição de grupo existente
5. Testar remoção de grupos

## 🔗 Dependências
- Aguarda implementação dos endpoints pelo @Pedro
- Necessita criação da tabela `grupos_arquivos`
- Requer adição do ícone `editar.svg`

## 📱 Screenshots
[Adicionar screenshots das funcionalidades]
```

### 3. **Workflow de Integração**
```yaml
# Sugestão para .github/workflows/integration.yml
name: Frontend Integration Tests
on: 
  pull_request:
    paths: ['frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test
      - name: Build frontend
        run: cd frontend && npm run build
```

## ⚠️ Considerações Importantes

### 1. **Ordem de Implementação**
1. **Backend**: Pedro implementar endpoints e tabela
2. **Frontend**: Integrar chamadas à API
3. **Teste**: Validar fluxo completo
4. **Deploy**: Aplicar em produção

### 2. **Tratamento de Erros**
- Implementar notificações toast para feedback
- Adicionar estados de loading nos botões
- Validar permissões no backend também

### 3. **Performance**
- Implementar paginação para muitos grupos
- Cache local para melhorar responsividade
- Lazy loading de arquivos por grupo

### 4. **Segurança**
- Validar permissões em todas as operações
- Sanitizar inputs no backend
- Implementar rate limiting

## 📞 Próximos Passos

1. **Pedro**: Implementar estrutura de banco e endpoints
2. **Frontend**: Substituir dados mockados por chamadas de API
3. **Testes**: Criar testes unitários e de integração
4. **Documentação**: Atualizar documentação da API

---

**Autor**: Claude (Assistant)  
**Data**: 2025  
**Versão**: 1.0  
**Status**: ✅ Frontend Implementado | ⏳ Aguardando Backend