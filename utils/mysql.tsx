import mysql, { Connection, Pool, PoolOptions, RowDataPacket  } from 'mysql2/promise';

let pool: Pool;

try {
    const port: number | undefined = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
    const poolConfig: PoolOptions = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: port,
        database: process.env.DB_NAME
    };
    pool = mysql.createPool(poolConfig);
} catch (err) {
    console.error(err);
}

export async function queryPromise(sql: string): Promise<any> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(sql);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}




/*
const mysql = require('mysql2');
let db;

try {
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    })
} catch (err) {
    console.error(err)
}

module.exports = db;*/