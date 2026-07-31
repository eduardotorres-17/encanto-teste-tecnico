# 🎟️ Encanto - Sistema de Tickets de Suporte

Este projeto é uma versão simplificada de um sistema de Help Desk, desenvolvido como teste técnico para a vaga de Dev Júnior Fullstack. A aplicação permite que usuários se cadastrem, façam login e gerenciem tickets de suporte, além de contar com uma integração de Inteligência Artificial para sugerir respostas.

## 🚀 Tecnologias Utilizadas

**Backend:**
* NestJS (TypeScript)
* PostgreSQL com TypeORM
* JWT & bcrypt (Autenticação)
* class-validator (Validação de DTOs)
* Jest (Testes Unitários)

**Frontend:**
* React 18 com Vite (TypeScript)
* Tailwind CSS
* Formik & Yup (Gerenciamento e validação de formulários)
* Axios (Requisições HTTP com Interceptors)
* React Router

**Infraestrutura:**
* Docker & Docker Compose (Multi-stage build com NGINX)

---

## ⚙️ Como Rodar o Projeto

O projeto foi totalmente containerizado para facilitar a execução. Você só precisa ter o **Docker** e o **Docker Compose** instalados na sua máquina.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/eduardotorres-17/encanto-teste-tecnico.git
   cd encanto-teste-tecnico
2. **Configure as variáveis de ambiente:**
   Na pasta `backend`, crie um arquivo `.env` baseado no `.env.example` (se houver) ou crie o arquivo do zero adicionando as seguintes variáveis:
   ```env
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=encanto_user
   DB_PASSWORD=encanto_password
   DB_NAME=encanto_tickets
   
   JWT_SECRET=uma_chave_secreta_qualquer
   GEMINI_API_KEY=sua_chave_da_api_do_google_aqui
3. **Suba os containers:**
   Na raiz do projeto, execute:
   ```bash
   docker-compose up --build -d
Acesse a aplicação:

Frontend: http://localhost:8080

Backend (API): http://localhost:3000

---

## 🧠 Decisões Técnicas

- Containerização do Frontend (Diferencial): Optei por utilizar um Multi-stage Build no Dockerfile do frontend. A aplicação é "buildada" pelo Node.js/Vite e os arquivos estáticos são servidos por um container NGINX super leve, o que otimiza a performance. Também configurei o NGINX para redirecionar as rotas para o index.html, evitando erros 404 ao atualizar a página com o React Router.

- Interceptors do Axios: Para manter o frontend limpo e seguro, configurei interceptors no Axios. O token JWT é injetado automaticamente nos cabeçalhos das requisições e, caso a API retorne um erro 401 Unauthorized (token expirado), o usuário é automaticamente deslogado e redirecionado para a tela de login.

- Segurança no NestJS: Utilizei o ValidationPipe globalmente com as opções whitelist e forbidNonWhitelisted para garantir que apenas os dados mapeados nos DTOs sejam processados, bloqueando payloads maliciosos.

- Integração com IA (Desafio Bônus): Implementei o botão de "Sugerir resposta com IA" utilizando a API do Google Gemini. Optei por realizar a integração via REST direto pelo Axios no NestJS, contornando problemas de compatibilidade e versionamento do SDK oficial do Google em ambientes Node.



## 🔄 O que faltou / O que faria diferente

Dado o prazo de 3 dias corridos, foquei em entregar um código limpo, funcional e bem estruturado. Com mais tempo para evoluir o sistema, eu implementaria:

1. **Testes de Usabilidade e Acessibilidade:** Para refinar a UI/UX, realizaria avaliações práticas (como aplicação de modelos de avaliação de usabilidade e uso de ferramentas de escaneamento de acessibilidade) para identificar possíveis barreiras de navegação e garantir que o sistema seja intuitivo para qualquer perfil de usuário.
2. **Deploy e Domínio Próprio:** Levaria a aplicação do ambiente local (Docker) para a nuvem, fazendo o deploy do frontend (ex: Vercel) e do backend/banco de dados, além de configurar um domínio customizado para o sistema rodar de forma pública na web.
3. **Suporte a Anexos nos Tickets:** Permitiria o upload de imagens e documentos (PDFs) para que os usuários enviassem evidências do problema, integrando a aplicação com um serviço de storage.
4. **Pipeline de CI/CD:** Criaria fluxos automatizados no GitHub Actions para rodar testes, linters e facilitar futuras atualizações em produção.




