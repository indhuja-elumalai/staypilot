import { Router } from 'express';
import { getDb } from '../db/connection.ts';
import { getAuth } from '@clerk/express';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/tasks', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const tasks = await db.collection("tasks").find({ userId }).sort({ createdAt: -1 }).toArray();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

router.post('/tasks', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { text, type } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const db = getDb();
        const newTask = { 
            text, 
            type: type || "task",
            completed: false, 
            userId, 
            createdAt: new Date(),
            closedAt: null
        };
        const result = await db.collection("tasks").insertOne(newTask);
        res.status(201).json({ message: "Task saved", id: result.insertedId, task: { ...newTask, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ error: "Failed to save task" });
    }
});

router.put('/tasks/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const { completed } = req.body;

        const db = getDb();
        await db.collection("tasks").updateOne(
            { _id: new ObjectId(id), userId },
            { 
                $set: { 
                    completed,
                    closedAt: completed ? new Date() : null 
                } 
            }
        );
        res.json({ message: "Task updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
});

router.put('/tasks/:id/edit', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: "Text is required" });

        const db = getDb();
        await db.collection("tasks").updateOne(
            { _id: new ObjectId(id), userId },
            { $set: { text } }
        );
        res.json({ message: "Task text updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to edit task" });
    }
});

router.delete('/tasks/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const db = getDb();
        await db.collection("tasks").deleteOne({ _id: new ObjectId(id), userId });
        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

export default router;
