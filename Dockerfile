# Use a imagem oficial do Node.js
FROM node:18-alpine

# Instale dependências do sistema necessárias para Prisma
RUN apk add --no-cache openssl

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instale as dependências
RUN npm ci

# Gere o cliente Prisma
RUN npx prisma generate

# Copie o código fonte
COPY . .

# Compile a aplicação
RUN npm run build

# Remova dependências de desenvolvimento
RUN npm prune --production

# Crie um usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Mude a propriedade dos arquivos para o usuário nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Exponha a porta 8080
EXPOSE 8080

# Configure a variável de ambiente PORT
ENV PORT=8080
ENV NODE_ENV=production

# Health check para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
