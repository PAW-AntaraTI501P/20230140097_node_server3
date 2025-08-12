require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT ;
const { router: todoRoutes, todos } = require("./routes/todo.js");
const todoDbRoutes = require("./routes/tododb.js");
const db = require("./database/db.js");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Route untuk API memory-based todos
app.use("/todos", todoRoutes);

// Route untuk database-based todos
app.use("/api/todos", todoDbRoutes);

app.get("/todos-data", (req, res) => {
  res.json(todos);
});

app.get("/todos-page", (req, res) => {
  res.render("todos-page", { 
    todos: todos,
    activePage: 'todos'
  });
});

app.get("/", (req, res) => {
  res.render("index", {
    activePage: 'home'
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    activePage: 'contact'
  });
});

// Route untuk menampilkan halaman todo dengan data dari database
app.get("/todo-view", (req, res) => {
  db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, todos) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.render("todo", {
      todos: todos,
      activePage: 'todo'
    });
  });
});

// API untuk menambah todo baru ke database
app.post("/todo-view/add", (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });

  db.query('INSERT INTO todos (task) VALUES (?)', [task], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add task' });
    
    db.query('SELECT * FROM todos WHERE id = ?', [result.insertId], (err, todos) => {
      if (err) return res.status(500).json({ error: 'Failed to get new task' });
      res.status(201).json(todos[0]);
    });
  });
});

// API untuk mengupdate todo di database
app.put("/todo-view/update/:id", (req, res) => {
  const { task } = req.body;
  const { id } = req.params;

  db.query(
    'UPDATE todos SET task = ? WHERE id = ?',
    [task, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to update task' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ id, task });
    }
  );
});

// API untuk menghapus todo dari database
app.delete("/todo-view/delete/:id", (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete task' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});