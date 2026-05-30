import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load immediately at the very top
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { connectToDatabase, getDb } from './db/connection.ts';
import bookingRoutes from './routes/bookings.ts';
import settingsRoutes from './routes/settings.ts';
import customerRoutes from './routes/customers.ts';
import operationRoutes from './routes/operations.ts';
import { getAuth } from '@clerk/express';

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Verify environment variables are present before starting
if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    console.error("CRITICAL ERROR: Missing Clerk environment variables.");
    process.exit(1);
}

// 2. CORS: Must be defined before routes
app.use(cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());

// 3. Clerk Middleware: Automatically uses process.env.CLERK_SECRET_KEY
app.use(clerkMiddleware());

// 4. Logging Middleware
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});



// 5. Routes

// Customer extraction middleware for POST /api/bookings
app.use('/api/bookings', async (req, res, next) => {
    if (req.method === 'POST') {
        try {
            const { name, phone, houseNo, street, city, state, pincode, country } = req.body;
            const { userId } = getAuth(req);
            
            if (name && phone && userId) {
                const db = getDb();
                // Upsert customer based on phone number and userId
                await db.collection("customers").updateOne(
                    { phone, userId },
                    { 
                        $set: { name, phone, userId, houseNo, street, city, state, pincode, country },
                        $setOnInsert: { createdAt: new Date(), stays: 0, lifetimeValue: 0, isVip: false }
                    },
                    { upsert: true }
                );
                
                // Also optionally increment stays and lifetime value if desired, 
                // but keeping it simple for now based on 'passive' extraction requirement.
            }
        } catch (error) {
            console.error("Error extracting customer logs:", error);
            // Non-destructive: if this fails, we just log it and proceed to the booking flow
        }
    }
    next();
}, bookingRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/operations', operationRoutes);

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.use((req, res, next) => {
    console.log(`404 Check: ${req.method} ${req.url} was not handled by any route.`);
    res.status(404).send("Route not found");
});
// 6. DB Connection and Server Start
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Critical DB Failure:", err);
});