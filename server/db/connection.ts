// server/db/connection.ts
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

let db: any;

export async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db("staypilot_db");
        console.log("Successfully connected to MongoDB: staypilot_db");
    } catch (e) {
        console.error("Database connection failed", e);
        process.exit(1);
    }
}

export function getDb() {
    return db;
}