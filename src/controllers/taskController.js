const { db } = require("../config/firebase");
const { formatDistanceToNow, format } = require("date-fns");
const { ptBR } = require("date-fns/locale");

// GET: Buscar todas as tarefas
exports.getTasks = async (req, res) => {
  try {
    const tasksSnapshot = await db.collection("tasks").get();
    if (tasksSnapshot.empty) {
      return res.status(404).json({ error: "Nenhuma tarefa encontrada" });
    }

    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate();
      return {
        id: doc.id,
        ...data,
        createdAt: {
          read: formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }),
          date: format(createdAt, "dd/MM/yyyy", { locale: ptBR }),
        },
      };
    });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return res.status(500).json({ error: "Erro ao buscar tarefas no banco de dados" });
  }
};

// CREATE: Criar uma nova tarefa
exports.createTask = async ({ title, description, status }) => {
  if (!title || !status) {
    throw new Error("Título e status são obrigatórios");
  }

  try {
    const newTask = { title, description, status, createdAt: new Date() };
    const taskRef = await db.collection("tasks").add(newTask);
    const task = { id: taskRef.id, ...newTask };
    return task;
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    throw new Error("Erro ao criar tarefa no banco de dados");
  }
};

// UPDATE: Atualizar tarefa existente
exports.updateTask = async (id, updates) => {
  try {
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      throw new Error("Tarefa não encontrada");
    }
    await db.collection("tasks").doc(id).update(updates);
    return { id, ...updates };
  } catch (error) {
    throw new Error(error.message || "Erro ao atualizar tarefa no banco de dados");
  }
};

// DELETE: Deletar tarefa
exports.deleteTask = async (id) => {
  try {
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists) {
      throw new Error("Tarefa não encontrada");
    }

    await db.collection("tasks").doc(id).delete();
  } catch (error) {
    throw new Error(error.message || "Erro ao deletar tarefa no banco de dados");
  }
};

// GET: Filtrar tarefas por status
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ error: "Status é obrigatório" });
    }

    let tasksSnapshot;
    if (status === "ALL") {
      tasksSnapshot = await db.collection("tasks").orderBy("createdAt", "desc").get();
    } else {
      tasksSnapshot = await db.collection("tasks").where("status", "==", status).get();
    }

    if (tasksSnapshot.empty) {
      return res.status(404).json({ error: `Nenhuma tarefa encontrada com status ${status}` });
    }

    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate();
      return {
        id: doc.id,
        ...data,
        createdAt: {
          read: formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }),
          date: format(createdAt, "dd/MM/yyyy", { locale: ptBR }),
        },
      };
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw new Error(error.message || "Erro ao atualizar tarefa no banco de dados");
  }
};

// GET: Buscar tarefas pelo título
exports.getTasksByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: "Título é obrigatório para a pesquisa" });
    }

    const tasksSnapshot = await db.collection("tasks").where("title", "==", title).get();

    if (tasksSnapshot.empty) {
      return res.status(404).json({ error: "Nenhuma tarefa encontrada com esse título" });
    }

    const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas pelo título:", error);
    return res.status(500).json({ error: "Erro ao buscar tarefas no banco de dados" });
  }
};
