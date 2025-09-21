# Sistema de Agrupamento de Arquivos

## 📁 Estrutura do Projeto

```
Projeto-Engenharia-de-Software/
├── app.py                    # Aplicação Flask principal
├── file_groups.py           # Módulo de gerenciamento de grupos de arquivos
├── requirements.txt         # Dependências Python
├── Dockerfile              # Configuração Docker
├── docker-compose.yml      # Orquestração Docker
├── .dockerignore          # Arquivos ignorados pelo Docker
├── templates/
│   └── index.html         # Interface HTML do sistema
├── static/                # Arquivos estáticos (CSS, JS, imagens)
├── uploads/              # Diretório para upload de arquivos
├── data/
│   └── database.db       # Banco de dados SQLite
└── README.md            # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Docker Desktop instalado
- Git

### Passos para Execução

1. **Clone o repositório**
```bash
git clone https://github.com/ItsMeThierry/Projeto-Engenharia-de-Software.git
cd Projeto-Engenharia-de-Software
```

2. **Crie a estrutura de diretórios**
```bash
mkdir -p templates static uploads data
```

3. **Copie os arquivos para os diretórios corretos**
- Copie o conteúdo HTML para `templates/index.html`
- Copie `app.py` e `file_groups.py` para a raiz do projeto
- Crie os arquivos de configuração Docker

4. **Execute com Docker Compose**
```bash
docker-compose up --build
```

5. **Acesse a aplicação**
- Abra seu navegador em: http://localhost:5000

6. **Para parar a aplicação**
```bash
docker-compose down
```

## 📋 Funcionalidades Implementadas

### ✅ Criar Grupos de Arquivos
- Interface modal para criação
- Campos: Nome e Descrição
- Validação de campos obrigatórios
- Verificação de nomes duplicados
- Feedback visual de sucesso/erro

### ✅ Editar Grupos
- Seleção do grupo via dropdown
- Preenchimento automático dos campos
- Validação de dados
- Atualização em tempo real

### ✅ Remover Grupos
- Seleção múltipla de grupos
- Mensagem de confirmação
- Aviso sobre ação irreversível
- Remoção em cascata de arquivos associados

## 🔌 API Endpoints

### Grupos de Arquivos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/file-groups` | Lista todos os grupos |
| GET | `/api/file-groups/{id}` | Obtém um grupo específico |
| POST | `/api/file-groups` | Cria novo grupo |
| PUT | `/api/file-groups/{id}` | Atualiza grupo existente |
| DELETE | `/api/file-groups` | Remove múltiplos grupos |
| GET | `/api/file-groups/{id}/files` | Lista arquivos de um grupo |

### Estrutura de Dados

#### Grupo de Arquivos
```json
{
  "id": 1,
  "name": "Nome do Grupo",
  "description": "Descrição do grupo",
  "fileCount": 10,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

## 🗄️ Banco de Dados

### Tabela: file_groups
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| name | TEXT | Nome do grupo |
| description | TEXT | Descrição |
| file_count | INTEGER | Quantidade de arquivos |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### Tabela: files
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| group_id | INTEGER | FK para file_groups |
| filename | TEXT | Nome do arquivo |
| filepath | TEXT | Caminho do arquivo |
| file_size | INTEGER | Tamanho em bytes |
| uploaded_at | TIMESTAMP | Data de upload |

## 🎨 Interface do Usuário

### Características
- Design responsivo e moderno
- Animações suaves
- Feedback visual imediato
- Modais para ações CRUD
- Toast notifications
- Loading states
- Empty states

### Paleta de Cores
- Principal: Gradiente roxo (#667eea → #764ba2)
- Sucesso: Verde água (#84fab0 → #8fd3f4)
- Aviso: Rosa/Amarelo (#fa709a → #fee140)
- Edição: Rosa/Vermelho (#f093fb → #f5576c)

## 🔧 Configurações de Ambiente

Você pode configurar as seguintes variáveis de ambiente no `docker-compose.yml`:

```yaml
environment:
  - DEBUG=True/False
  - DATABASE_PATH=/app/data/database.db
  - SECRET_KEY=sua-chave-secreta
  - PORT=5000
```

## 📝 Notas de Desenvolvimento

### Para Desenvolvimento Local (sem Docker)

1. **Crie um ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Execute a aplicação**
```bash
python app.py
```

### Integração com o Backend do Pedro

O sistema está preparado para integração com o backend que está sendo desenvolvido. As funções no arquivo `file_groups.py` já fazem as chamadas corretas ao banco de dados e retornam os dados no formato esperado pela interface.

Para integrar:
1. Ajuste a string de conexão do banco se necessário
2. Certifique-se que as tabelas sejam criadas conforme especificado
3. Os endpoints da API já estão prontos para uso

## 🐛 Solução de Problemas

### Erro de porta em uso
```bash
# Verificar processos na porta 5000
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Matar processo se necessário
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Erro de permissão no Docker
```bash
# Dar permissão de execução
chmod +x docker-compose.yml
sudo docker-compose up --build
```

### Banco de dados não inicializa
```bash
# Remover banco antigo e recriar
rm data/database.db
docker-compose down
docker-compose up --build
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `docker-compose logs`
2. Abra uma issue no GitHub
3. Contate a equipe de desenvolvimento

## 📄 Licença

Este projeto faz parte do Projeto de Engenharia de Software.