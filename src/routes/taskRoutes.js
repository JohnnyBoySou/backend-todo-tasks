const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByTitle,
} = require("../controllers/taskController");

const router = express.Router();

// READ - Buscar todas as tarefas
router.get("/", getTasks);

// CREATE - Criar uma nova tarefa
router.post("/", async (req, res) => {
  try {
    const task = await createTask(req.body);
    const cleanTask = JSON.parse(JSON.stringify(task)); // Limpar dados circulares
    res.status(201).json(cleanTask); // Retornar tarefa criada
    req.io.emit("taskCreate", cleanTask); // Emitir evento
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// UPDATE - Atualizar tarefa existente
router.put("/:id", async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.body);
    res.status(200).json(task);
    req.io.emit("taskUpdated", task); // Emitir evento de atualização
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// DELETE - Deletar tarefa
router.delete("/:id", async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.status(200).json({ message: "Tarefa excluída com sucesso" });
    req.io.emit("taskDeleted", req.params.id); // Emitir evento de exclusão
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    res.status(500).json({ error: "Erro ao excluir tarefa" });
  }
});

// Filtros de tarefas
router.get("/filter", getTasksByStatus);
router.get("/title", getTasksByTitle); // Alterado para GET e query params
module.exports = router;
