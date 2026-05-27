import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load immediately at the very top
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { connectToDatabase } from './db/connection.ts';
import bookingRoutes from './routes/bookings.ts';
import settingsRoutes from './routes/settings.ts';

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

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