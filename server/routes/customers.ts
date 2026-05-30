import { Router } from 'express';
import { getDb } from '../db/connection.ts';
import { getAuth } from '@clerk/express';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const customers = await db.collection("customers").find({ userId }).toArray();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customers" });
    }
});

router.put('/:id/star', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const { isVip } = req.body;

        const db = getDb();
        await db.collection("customers").updateOne(
            { _id: new ObjectId(id), userId },
            { $set: { isVip } }
        );
        res.json({ message: "Customer updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
});

router.post('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { name, phone, houseNo, street, city, state, pincode, country, isVip } = req.body;
        if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

        const db = getDb();
        const newCustomer = {
            name, phone, houseNo, street, city, state, pincode, country, isVip: isVip || false,
            userId, createdAt: new Date(), stays: 0, lifetimeValue: 0
        };
        const result = await db.collection("customers").insertOne(newCustomer);
        res.status(201).json({ message: "Customer created", customer: { ...newCustomer, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ error: "Failed to create customer" });
    }
});

router.put('/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const { name, phone, houseNo, street, city, state, pincode, country } = req.body;

        const db = getDb();
        await db.collection("customers").updateOne(
            { _id: new ObjectId(id), userId },
            { $set: { name, phone, houseNo, street, city, state, pincode, country } }
        );
        res.json({ message: "Customer updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
});

router.delete('/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const db = getDb();
        await db.collection("customers").deleteOne({ _id: new ObjectId(id), userId });
        res.json({ message: "Customer deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete customer" });
    }
});

export default router;
