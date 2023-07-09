import dotenv from 'dotenv';
const mysql = require('mysql2');
require('dotenv').config({
    path: '.env.local'
});

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

module.exports = db;