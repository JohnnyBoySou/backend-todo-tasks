const express = require("express");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { getTasksByStatus, getTasksByTitle } = require("../controllers/taskController");

const router = express.Router();
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/filter", getTasksByStatus);
router.get("/title/:title", getTasksByTitle);

module.exports = router;
