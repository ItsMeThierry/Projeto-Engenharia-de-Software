# Dockerfile
FROM python:3.9-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p templates static uploads

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["python", "app.py"]






