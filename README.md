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
   git clone <LINK_DO_SEU_REPOSITORIO>
   cd encanto-tickets
Configure as variáveis de ambiente:

Na pasta backend, crie um arquivo .env baseado no .env.example (se houver) ou adicione as seguintes variáveis:

Snippet de código
DATABASE_URL=postgres://encanto_user:encanto_password@postgres:5432/encanto_tickets
JWT_SECRET=sua_chave_secreta_aqui
GEMINI_API_KEY=sua_chave_da_api_do_google_aqui
Suba os containers:
Na raiz do projeto, execute:

Bash
docker-compose up --build -d
Acesse a aplicação:

Frontend: http://localhost:8080

Backend (API): http://localhost:3000

🧠 Decisões Técnicas
Containerização do Frontend (Diferencial): Optei por utilizar um Multi-stage Build no Dockerfile do frontend. A aplicação é "buildada" pelo Node.js/Vite e os arquivos estáticos são servidos por um container NGINX super leve, o que otimiza a performance. Também configurei o NGINX para redirecionar as rotas para o index.html, evitando erros 404 ao atualizar a página com o React Router.

Interceptors do Axios: Para manter o frontend limpo e seguro, configurei interceptors no Axios. O token JWT é injetado automaticamente nos cabeçalhos das requisições e, caso a API retorne um erro 401 Unauthorized (token expirado), o usuário é automaticamente deslogado e redirecionado para a tela de login.

Segurança no NestJS: Utilizei o ValidationPipe globalmente com as opções whitelist e forbidNonWhitelisted para garantir que apenas os dados mapeados nos DTOs sejam processados, bloqueando payloads maliciosos.

Integração com IA (Desafio Bônus): Implementei o botão de "Sugerir resposta com IA" utilizando a API do Google Gemini. Optei por realizar a integração via REST direto pelo Axios no NestJS, contornando problemas de compatibilidade e versionamento do SDK oficial do Google em ambientes Node.

🔄 O que faltou / O que faria diferente
Dado o prazo de 3 dias corridos, foquei em entregar um código limpo, funcional e bem estruturado. Com mais tempo, eu implementaria:

Paginação: Para a lista de tickets do usuário. À medida que o banco crescesse, trazer todos os tickets de uma vez impactaria a performance.

Testes E2E (Ponta a Ponta): Além dos testes unitários já implementados no backend (Jest), adicionaria testes E2E com Cypress ou Playwright no frontend para simular a jornada completa do usuário.

Pipeline de CI/CD: Criaria fluxos no GitHub Actions para rodar o linter, formatador e testes automaticamente a cada Push ou Pull Request.

Refresh Token: Implementaria uma lógica de Refresh Token no backend para melhorar a experiência do usuário, mantendo-o logado com segurança sem precisar digitar a senha novamente após a expiração do JWT.
