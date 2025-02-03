# Backend - Gerenciamento de Tarefas

## Desafio

Desenvolver uma aplicação backend para gerenciamento de tarefas com as seguintes funcionalidades: cadastrar, listar, atualizar e excluir tarefas, com status (TODO, DOING, DONE) e com integração de autenticação via Google utilizando Firebase.

## Funcionalidades

1. **Cadastro de Tarefas**: O sistema permite criar novas tarefas.
2. **Listagem de Tarefas**: Exibe todas as tarefas com seus respectivos status.
3. **Atualização de Tarefas**: Permite atualizar as informações das tarefas.
4. **Exclusão de Tarefas**: Permite excluir tarefas existentes.
5. **Filtragem de Tarefas**: As tarefas podem ser filtradas por status ou título.

## Tecnologias Utilizadas

- **Node.js**: Backend do sistema.
- **Express**: Framework para gerenciamento das rotas.
- **Firebase**: Banco de dados Firestore para armazenar as tarefas.
- **Google Auth**: Autenticação via Google.
- **Socket.io**: Comunicação em tempo real para atualizar as tarefas em vários dispositivos simultaneamente.
- **Date-fns**: Para manipulação e formatação de datas.

## Rotas da API

### **Autenticação**
- `POST /api/auth/login`: Realiza o login com Google Auth. Requer um token de autenticação enviado no corpo da requisição.

### **Tarefas**
- `GET /api/tasks`: Retorna todas as tarefas.
- `POST /api/tasks`: Cria uma nova tarefa.
- `PUT /api/tasks/:id`: Atualiza uma tarefa existente.
- `DELETE /api/tasks/:id`: Exclui uma tarefa.
- `GET /api/tasks/filter`: Filtra tarefas por status (TODO, DOING, DONE).
- `GET /api/tasks/title`: Filtra tarefas pelo título.

## Estrutura de Tarefas

Cada tarefa possui os seguintes campos:
- `title`: Título da tarefa (obrigatório).
- `description`: Descrição da tarefa.
- `status`: Status da tarefa (TODO, DOING, DONE).
- `createdAt`: Data de criação da tarefa.

## Instruções de Execução

### 1. Clonar o Repositório

```bash
git clone https://github.com/JohnnyBoySou/backend-todo-tasks.git
cd backend-todo-tasks
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar o Firebase

1. Crie um projeto no [Firebase](https://firebase.google.com/).
2. No console do Firebase, configure o Firestore e a autenticação com o Google.
3. Baixe o arquivo `google-services.json` e configure as variáveis de ambiente no arquivo `.env`:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
```

### 4. Executar o Servidor

```bash
npm start
```

O servidor estará rodando na porta 5000 (ou a porta configurada no `.env`).

## Funcionalidades em Tempo Real

O sistema usa o **Socket.io** para emitir eventos de criação, atualização e exclusão de tarefas. Quando uma tarefa é modificada, todos os clientes conectados recebem a atualização em tempo real.

## Testes Unitários

A aplicação deve possuir testes para garantir o funcionamento adequado das rotas e da manipulação das tarefas. Utilize a ferramenta de testes de sua escolha para validar a aplicação.

## Considerações Finais

Este projeto tem como objetivo servir como base para a construção de um sistema de gerenciamento de tarefas utilizando Firebase para persistência de dados e Google Auth para autenticação.


Desenvolvido por [João Sousa](https://github.com/JohnnyBoySou).

---
