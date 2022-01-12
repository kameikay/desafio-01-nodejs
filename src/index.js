const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  request.username = username;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const user = users.find((user) => user.username === username);

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
    }
  });

  return response.status(200).json(todoExists);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists)
    return response.status(404).json({ error: "Mensagem do erro" });

  user.todos.forEach((todo) => {
    if (todo.id === id) todo.done = true;
  });

  return response.status(200).json(todoExists);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos.forEach((todo) => {
    if (todo.id === id) {
      const newTodos = user.todos.filter((todo) => todo.id !== id);
      user.todos = newTodos;
      return response.status(204).send();
    }
  });
});

module.exports = app;
