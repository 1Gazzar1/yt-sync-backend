import { config} from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config(); 

const DB_URL = process.env.DATABASE_URL!; 
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});
