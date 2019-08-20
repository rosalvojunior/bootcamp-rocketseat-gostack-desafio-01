const express = require("express");

const server = express();

server.use(express.json());

const projects = [];

let reqNumber = 0;

server.use((req, res, next) => {
  reqNumber++;
  console.log(`Requisição: ${reqNumber}`);
  return next();
});

function checkDuplicateId(req, res, next) {
  if (projects.findIndex(project => project.id == req.body.id) > -1) {
    return res.status(400).json({ error: "Já existe um projeto com esse ID." });
  }
  return next();
}

function checkProjectExists(req, res, next) {
  const erros = [];
  if (!req.body.id) {
    erros.push("Project id is requered.");
  }
  if (!req.body.title) {
    erros.push("Title is requered.");
  }
  if (!req.body.tasks) {
    erros.push("Tasks is requered.");
  }

  if (erros.length > 0) {
    return res.status(400).json({ error: erros });
  }

  return next();
}

function checkProjectInArray(req, res, next) {
  const index = projects.findIndex(project => project.id == req.params.id);

  if (index == -1) {
    return res.status(400).json({ error: "Project does not exists." });
  }

  req.index = index;

  return next();
}

function checkTitleInBody(req, res, next) {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is requered." });
  }

  return next();
}

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.post("/projects", checkDuplicateId, checkProjectExists, (req, res) => {
  const { id, title, tasks } = req.body;

  projects.push({ id: id, title: title, tasks: tasks });

  return res.json(projects);
});

server.put(
  "/projects/:id",
  checkProjectInArray,
  checkTitleInBody,
  (req, res) => {
    const { title } = req.body;

    projects[req.index].title = title;

    return res.json(projects);
  }
);

server.delete("/projects/:id", checkProjectInArray, (req, res) => {
  projects.splice(req.index, 1);

  return res.send();
});

server.post(
  "/projects/:id/tasks",
  checkProjectInArray,
  checkTitleInBody,
  (req, res) => {
    const { title } = req.body;

    projects[req.index].tasks.push(title);

    return res.json(projects);
  }
);

server.listen(3000);
