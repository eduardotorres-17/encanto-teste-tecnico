# Usa uma imagem leve do Node.js (versão 18 costuma ser o padrão atual)
FROM node:18-alpine

# Define a pasta de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos que listam as dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o resto do código da sua máquina para o container
COPY . .

# Compila o código TypeScript do NestJS para JavaScript (gera a pasta /dist)
RUN npm run build

# Expõe a porta padrão que o NestJS utiliza
EXPOSE 3000

# O comando que o container vai rodar quando for iniciado
CMD ["npm", "run", "start:prod"]