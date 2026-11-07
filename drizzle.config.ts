import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
    schema: './db/schema/*',
    out: './drizzle-kit',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config;
