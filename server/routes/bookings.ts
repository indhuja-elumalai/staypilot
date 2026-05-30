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
import { ObjectId } from 'mongodb';

const router = Router();

router.post('/', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const db = getDb();
        const newBooking = { ...req.body, userId, createdAt: new Date() };
        const result = await db.collection("bookings").insertOne(newBooking);

        // Auto-add or update customer
        if (req.body.phone && req.body.name) {
            await db.collection("customers").updateOne(
                { phone: req.body.phone, userId },
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email || "",
                        houseNo: req.body.houseNo || "",
                        street: req.body.street || "",
                        city: req.body.city || "",
                        state: req.body.state || "",
                        pincode: req.body.pincode || "",
                        country: req.body.country || "India"
                    },
                    $setOnInsert: { createdAt: new Date(), stays: 0, lifetimeValue: 0, isVip: false }
                },
                { upsert: true }
            );
        }

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

router.put('/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const db = getDb();
        
        // Exclude _id and userId from the update body
        const { _id, userId: reqUserId, ...updateData } = req.body;
        
        await db.collection("bookings").updateOne(
            { _id: new ObjectId(id), userId },
            { $set: updateData }
        );

        // Auto-add or update customer
        if (updateData.phone && updateData.name) {
            await db.collection("customers").updateOne(
                { phone: updateData.phone, userId },
                {
                    $set: {
                        name: updateData.name,
                        email: updateData.email || "",
                        houseNo: updateData.houseNo || "",
                        street: updateData.street || "",
                        city: updateData.city || "",
                        state: updateData.state || "",
                        pincode: updateData.pincode || "",
                        country: updateData.country || "India"
                    },
                    $setOnInsert: { createdAt: new Date(), stays: 0, lifetimeValue: 0, isVip: false }
                },
                { upsert: true }
            );
        }

        res.json({ message: "Booking updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update booking" });
    }
});

router.delete('/:id', async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const db = getDb();
        await db.collection("bookings").deleteOne({ _id: new ObjectId(id), userId });
        res.json({ message: "Booking deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete booking" });
    }
});

export default router;