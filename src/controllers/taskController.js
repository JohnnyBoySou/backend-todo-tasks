const { db } = require("../config/firebase");
const { formatDistanceToNow, format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

exports.getTasks = async (req, res) => {
  try {
    const tasksSnapshot = await db.collection("tasks").get();
    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate();
      return {
        id: doc.id,
        ...data,
        createdAt: {
          read: formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }),
          date: format(createdAt, 'dd/MM/yyyy', { locale: ptBR })  
        }};
    });
    setTimeout(() => {
      return res.status(200).json(tasks);
    }, 2000);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, finishDate } = req.body;
    const newTask = { title, description, status: "TODO", createdAt: new Date() };
    if (finishDate) {
      newTask.finishDate = finishDate;
    }
    const taskRef = await db.collection("tasks").add(newTask);
    setTimeout(() => {
      return res.status(201).json({ id: taskRef.id, ...newTask });
    }, 3000);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar tarefa" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.collection("tasks").doc(id).update(updates);
    return res.status(200).json({ id, ...updates });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("tasks").doc(id).delete();
    setTimeout(() => {
      return res.status(200).json({ message: "Tarefa removida com sucesso" });
    }, 3000);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
};
//FILTER
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    let tasksSnapshot;

    if (status === "ALL") {
      tasksSnapshot = await db.collection("tasks").orderBy("createdAt", "desc").get();
    } else {
      tasksSnapshot = await db.collection("tasks").where("status", "==", status).get();
    }
    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt.toDate();
      return {
        id: doc.id,
        ...data,
        createdAt: {
          read: formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }),
          date: format(createdAt, 'dd/MM/yyyy', { locale: ptBR })
        }
      };
    });
    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};
//PESQUISAR POR NOME 
exports.getTasksByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const tasksSnapshot = await db.collection("tasks").where("title", "==", title).get();
    const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};