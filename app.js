require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT ;
const { router: todoRoutes, todos } = require("./routes/todo.js");
const todoDbRoutes = require("./routes/tododb.js");
const db = require("./database/db.js");
const expressLayouts = require("express-ejs-layouts");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("layout", "layouts/main-layout");
app.use(expressLayouts);
app.use("/todos", todoRoutes);
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

app.get("/todo-view", (req, res) => {
    db.query('SELECT * FROM todos', (err, results) => { 
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.render("todo", {
            todos: results
        });
    });
});

app.use("/todos", todoRoutes);


app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});