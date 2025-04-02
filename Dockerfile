FROM node:18-alpine

WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./
COPY tsconfig.json ./
COPY wrangler.toml ./
COPY src ./src

# Instalar dependências
RUN npm install

# Compilar TypeScript
RUN npm run build

# Expor a porta
EXPOSE 8787

# Comando para iniciar o servidor
CMD ["npm", "run", "start"] 