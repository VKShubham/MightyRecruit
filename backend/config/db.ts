require('dotenv').config();
const { Pool }  = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URI
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});
  
pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;