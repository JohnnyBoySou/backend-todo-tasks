const { getTasks, createTask, updateTask, deleteTask, getTasksByStatus, getTasksByTitle } = require("../../controllers/taskController");
const { db } = require("../../config/firebase");
const { mockRequest, mockResponse } = require("jest-mock-req-res");
const { format, formatDistanceToNow } = require('date-fns');
const { ptBR } = require('date-fns/locale');

jest.mock("../../config/firebase", () => ({
    db: {
        collection: jest.fn().mockReturnThis(),
        get: jest.fn(),
        doc: jest.fn().mockReturnThis(),
        add: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
    },
}));

describe("TaskController", () => {

    describe("getTasks", () => {
        it("Mostra todas as Tasks", async () => {
            const tasksData = [
                {
                    id: "1",
                    title: "TASK 1",
                    status: "DONE",
                    createdAt: {
                        toDate: () => new Date()
                    }
                },
                {
                    id: "2",
                    title: "TASK 2",
                    description: "TASK 2 DESCRICAO",
                    status: "TODO",
                    createdAt: {
                        toDate: () => new Date()
                    }
                },
            ];

            db.collection.mockReturnValueOnce({
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: tasksData.map(data => ({
                        id: data.id,
                        data: () => data,
                    })),
                }),
            });

            const req = mockRequest();
            const res = mockResponse();

            await getTasks(req, res);

            const expectedData = tasksData.map(task => ({
                ...task,
                createdAt: {
                    date: expect.any(String),
                    read: expect.any(String),
                }
            }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(expectedData));
        });
    });

    describe("createTask", () => {
        it("Cria uma task e retorna ela mesma", async () => {
            const newTask = { title: "New Task", description: "Test task", status: "DOING" };
            db.collection.mockReturnValueOnce({
                add: jest.fn().mockResolvedValue({ id: "1" }),
            });

            const result = await createTask(newTask);

            expect(result).toEqual({ id: "1", createdAt: expect.any(Date), ...newTask });
        });

        it("should throw error if title or status is missing", async () => {
            const newTask = { description: "Test task" };

            await expect(createTask(newTask)).rejects.toThrow("Título e status são obrigatórios");
        });
    });

    describe("updateTask", () => {
        it("Atualiza uma task caso o id exista", async () => {
            const taskId = "1";
            const updates = { status: "DONE" };
            db.collection.mockReturnValueOnce({
                doc: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ exists: true }),
                update: jest.fn().mockResolvedValue(),
            });

            const result = await updateTask(taskId, updates);

            expect(result).toEqual({ id: taskId, ...updates });
        });

        it("Retorna erro caso o id não exista", async () => {
            const taskId = "1";
            const updates = { status: "DONE" };
            db.collection.mockReturnValueOnce({
                doc: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ exists: false }),
            });

            await expect(updateTask(taskId, updates)).rejects.toThrow("Tarefa não encontrada");
        });
    });

    describe("deleteTask", () => {
        it("Exclui a task caso exista", async () => {
            const taskId = "1";
            db.collection.mockReturnValueOnce({
                doc: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ exists: true }),
                delete: jest.fn().mockResolvedValue(),
            });

            await deleteTask(taskId);

            expect(db.collection().doc().delete).toHaveBeenCalled();
        });

        it("Retorna erro caso a task nao exista", async () => {
            const taskId = "1";
            db.collection.mockReturnValueOnce({
                doc: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ exists: false }),
            });

            await expect(deleteTask(taskId)).rejects.toThrow("Tarefa não encontrada");
        });
    });

    describe("getTasksByStatus", () => {
        beforeEach(() => {
            db.get.mockReset();
            db.collection.mockReset();
        });
        it("Retorna as tasks filtras por status", async () => {
            const createdAt = new Date("2023-01-01T00:00:00Z");
            const tasksData = [
                {
                    id: "1",
                    title: "TASK 1",
                    description: "test",
                    status: "DOING",
                    createdAt: { toDate: () => createdAt }, 
                },
            ];

            db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: tasksData.map((data) => ({
                        id: data.id,
                        data: () => data,
                    })),
                }),
            });

            const req = mockRequest({ query: { status: "DOING" } });
            const res = mockResponse();
            await getTasksByStatus(req, res);
            const expectedTasksData = tasksData.map((task) => ({
                ...task,
                createdAt: {
                    date: format(createdAt, "dd/MM/yyyy", { locale: ptBR }), 
                    read: formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR }),
                },
            }));

            expect(db.collection).toHaveBeenCalledWith("tasks");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(expectedTasksData));
        });

        it("Retorna erro caso nenhuma task seja encontrada naquele status", async () => {
            db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: true,
                    docs: [],
                }),
            });

            const req = mockRequest({ query: { status: "DOING" } });
            const res = mockResponse();

            await getTasksByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Nenhuma tarefa encontrada com status DOING" });
        });
    });

    describe("getTasksByTitle", () => {
        it("Retorna as tasks por titulo", async () => {
            const tasksData = [
                { id: "1", title: "Test Task", status: "DOING", createdAt: new Date() },
            ];
            db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: tasksData.map(data => ({
                        id: data.id,
                        data: () => data,
                    })),
                }),
            });

            const req = mockRequest({ query: { title: "Test Task" } });
            const res = mockResponse();

            await getTasksByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(tasksData));
        });

        it("Retorna erro caso o titulo não seja enviado", async () => {
            const req = mockRequest({ query: {} });
            const res = mockResponse();

            await getTasksByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Título é obrigatório para a pesquisa" });
        });

        it("Retorna erro caso não encontre nenhuma task com o titulo enviado", async () => {
            db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: true,
                    docs: [],
                }),
            });

            const req = mockRequest({ query: { title: "Nonexistent Task" } });
            const res = mockResponse();

            await getTasksByTitle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Nenhuma tarefa encontrada com esse título" });
        });
    });
});
