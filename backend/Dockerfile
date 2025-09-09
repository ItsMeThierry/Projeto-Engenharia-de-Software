# Usa uma imagem base do Node.js
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /src

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta padrão (normalmente 5000)
EXPOSE 5000

# Comando para iniciar a aplicação em modo de desenvolvimento
CMD ["npm", "start"]