# Cadastro de Pessoas

Aplicação web simples para cadastrar, listar, atualizar e excluir pessoas. O projeto utiliza uma interface responsiva em HTML, Bootstrap e JavaScript e uma API REST desenvolvida com Node.js, Express, Sequelize e SQLite.

## Funcionalidades

- Cadastro de pessoas com nome, email e data de nascimento
- Listagem das pessoas cadastradas
- Atualização dos dados
- Exclusão com confirmação
- Validação dos dados no front-end e no back-end
- Persistência dos dados em banco SQLite
- Proteção das operações de escrita por chave da API

## Tecnologias

### Front-end

- HTML5
- CSS com Bootstrap 5
- JavaScript
- Font Awesome
- Fetch API

### Back-end

- Node.js
- Express
- Sequelize
- SQLite
- CORS

## Estrutura do projeto

```text
cadastro_pessoas/
├── back-end/
│   ├── model/
│   │   └── user.js
│   ├── routes/
│   │   └── users.js
│   ├── database.js
│   ├── database.sqlite
│   ├── package.json
│   └── server.js
├── front-end/
│   ├── index.html
│   └── script.js
├── .gitignore
└── README.md
```

## Requisitos

- Node.js
- npm

## Instalação

No terminal, entre na pasta do projeto e instale as dependências do back-end:

```powershell
cd back-end
npm install
```

## Configuração

O servidor pode ser configurado pelas seguintes variáveis de ambiente:

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `5000` | Porta do servidor |
| `API_KEY` | Nenhum | Chave exigida nas operações de escrita |
| `CORS_ORIGIN` | `http://localhost:5500,http://127.0.0.1:5500` | Origens permitidas, separadas por virgula |

Antes de iniciar o projeto, defina a chave da API no PowerShell:

```powershell
$env:API_KEY="uma-chave-segura"
```

A chave será solicitada pelo front-end na primeira operação de cadastro, atualização ou exclusão. Ela fica armazenada apenas na sessão atual do navegador.

No PowerShell, a porta e a origem CORS também podem ser configuradas quando necessário:

```powershell
$env:PORT="5000"
$env:CORS_ORIGIN="http://localhost:5500,http://127.0.0.1:5500"
```

## Executando o projeto

### Servidor e front-end juntos

Na pasta `back-end`, execute:

```powershell
npm start
```

A interface será disponibilizada pelo Express em:

```text
http://localhost:5000
```

A API será disponibilizada em:

```text
http://localhost:5000/api/users
```

### Alternativa com Live Server

Caso utilize uma extensão Live Server na porta `5500`, execute primeiro o servidor da API:

```powershell
cd back-end
npm start
```

Em seguida, abra `front-end/index.html` com o Live Server. Nesse modo, o front-end envia as requisições para `http://localhost:5000/api/users`.

## Modelo de dados

O modelo `User` possui os seguintes campos:

| Campo | Tipo | Regras |
|---|---|---|
| `id` | Inteiro | Chave primária gerada automaticamente |
| `nome` | Texto | Obrigatório; entre 2 e 100 caracteres |
| `email` | Texto | Obrigatório; formato de email válido e único |
| `dataNascimento` | Data | Obrigatória; deve representar uma data no passado |

O banco SQLite fica em `back-end/database.sqlite` e é criado ou atualizado automaticamente pelo Sequelize quando o servidor inicia.

## Endpoints da API

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/users` | Lista todas as pessoas | Não |
| `GET` | `/api/users/:id` | Busca uma pessoa pelo ID | Não |
| `POST` | `/api/users` | Cadastra uma pessoa | Sim |
| `PUT` | `/api/users/:id` | Atualiza uma pessoa | Sim |
| `DELETE` | `/api/users/:id` | Exclui uma pessoa | Sim |

Nas requisições de escrita, envie a chave no cabeçalho:

```text
X-API-Key: sua-chave-da-api
```

Exemplo de corpo JSON para cadastro ou atualização:

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "dataNascimento": "1995-06-15"
}
```

Exemplo com `curl` no PowerShell:

```powershell
curl.exe -X POST "http://localhost:5000/api/users" `
  -H "Content-Type: application/json" `
  -H "X-API-Key: uma-chave-segura" `
  -d '{\"nome\":\"Maria Silva\",\"email\":\"maria@example.com\",\"dataNascimento\":\"1995-06-15\"}'
```

## Status HTTP

- `200` - requisição realizada com sucesso
- `201` - pessoa cadastrada
- `400` - dados inválidos
- `401` - chave da API ausente ou inválida
- `404` - pessoa não encontrada
- `409` - email já cadastrado
- `500` - erro interno do servidor
- `503` - chave da API não configurada no servidor
