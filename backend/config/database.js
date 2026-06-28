import pg from "pg";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Test connection on startup
pool.connect()
    .then(() => console.log("✅ Database connected successfully"))
    .catch((err) => {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
        process.exit(1);
    });

export default pool;
