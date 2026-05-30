import { Router } from 'express';
import { getDb } from '../db/connection.ts';
import { getAuth } from '@clerk/express';
import { ObjectId } from 'mongodb';

const router = Router();

// GET all expenses
router.get('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const expenses = await db.collection("expenses").find({ userId }).sort({ date: -1 }).toArray();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// GET Expense Bank Status
router.get('/bank/status', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        
        // Fetch daily bank budget from settings (or default)
        const settings = await db.collection("settings").findOne({ userId });
        const dailyBudget = Number(settings?.dailyBankLimit || 500);
        const startDateString = settings?.bankStartDate || new Date().toISOString();
        const startDate = new Date(startDateString);
        
        // Calculate days since inception (inclusive of today)
        const today = new Date();
        const daysDiff = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const allocatedBudget = daysDiff * dailyBudget;

        // Fetch all bank transactions
        const bankExpenses = await db.collection("expenses").find({ userId, type: 'Bank' }).toArray();
        
        const deposits = bankExpenses.filter(e => e.category === 'Deposit').reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const deductions = bankExpenses.filter(e => e.category === 'Deduction').reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const currentBalance = allocatedBudget + deposits - deductions;

        res.json({
            dailyBudget,
            startDate,
            daysActive: daysDiff,
            allocatedBudget,
            deposits,
            deductions,
            currentBalance
        });
    } catch (error) {
        console.error("Failed to calculate bank status:", error);
        res.status(500).json({ error: "Failed to calculate bank status" });
    }
});

// POST new expense
router.post('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const newExpense = { 
            ...req.body, 
            userId, 
            createdAt: new Date(),
            date: req.body.date ? new Date(req.body.date) : new Date() 
        };
        const result = await db.collection("expenses").insertOne(newExpense);

        res.status(201).json({ message: "Expense saved!", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to save expense" });
    }
});

// DELETE expense
router.delete('/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const db = getDb();
        await db.collection("expenses").deleteOne({ _id: new ObjectId(id), userId });
        res.json({ message: "Expense deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

export default router;
