import { Router } from 'express';
import { getDb } from '../db/connection.ts';
import { getAuth } from '@clerk/express';

const router = Router();

// Logging middleware for this router
router.use((req, res, next) => {
    console.log("Settings Router reached:", req.method, req.url);
    next();
});

router.post('/', async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const { name, address, phone, terms } = req.body;

        await db.collection("settings").updateOne(
            { userId },
            { $set: { name, address, phone, terms, userId, updatedAt: new Date() } },
            { upsert: true }
        );

        res.status(200).json({ message: "Settings saved successfully" });
    } catch (error) {
        console.error("SETTINGS_POST_ERROR:", error);
        res.status(500).json({ error: "Failed to save settings" });
    }
});

// FIX: Ensure we use the userId from the URL parameter
// routes/settings.ts
router.get('/', async (req, res) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        // Look up by userId directly from Clerk session
        const settings = await db.collection("settings").findOne({ userId });

        res.status(200).json(settings || { name: "", address: "", phone: "", terms: "" });
    } catch (error) {
        console.error("SETTINGS_GET_ERROR:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

export default router;