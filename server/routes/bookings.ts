// import express from 'express';
// import { getDb } from '../db/connection.ts';
// import { requireAuth } from '@clerk/express';

// const router = express.Router();

// // Apply requireAuth to all routes in this file
// // This ensures any request must have a valid Clerk session
// router.use(requireAuth());

// // POST a new booking
// router.post('/', async (req: any, res: any) => {
//     try {
//         const { userId } = req.auth; // Get userId directly from Clerk
//         const db = getDb();

//         // Attach the authenticated userId to the booking
//         const newBooking = {
//             ...req.body,
//             userId,
//             createdAt: new Date()
//         };

//         const result = await db.collection("bookings").insertOne(newBooking);
//         res.status(201).json({ message: "Booking saved!", id: result.insertedId });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to save booking" });
//     }
// });

// // GET all bookings for the authenticated user
// router.get('/', async (req: any, res: any) => {
//     try {
//         const { userId } = req.auth; // Get userId directly from Clerk
//         const db = getDb();

//         // Only return bookings that match this userId
//         const bookings = await db.collection("bookings").find({ userId }).toArray();
//         res.json(bookings);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch bookings" });
//     }
// });

// export default router;

import { Router } from 'express';
import { getDb } from '../db/connection.ts';
import { getAuth } from '@clerk/express';

const router = Router();

router.post('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const newBooking = { ...req.body, userId, createdAt: new Date() };
        const result = await db.collection("bookings").insertOne(newBooking);
        res.status(201).json({ message: "Booking saved!", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Failed to save booking" });
    }
});

router.get('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const bookings = await db.collection("bookings").find({ userId }).toArray();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

export default router;