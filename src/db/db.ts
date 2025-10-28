import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";
import { config } from "dotenv";

config();
const conn = postgres(process.env.DATABASE_URL);
const db = drizzle({ client: conn });
