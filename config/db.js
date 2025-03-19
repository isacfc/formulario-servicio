const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trabajadores_servicio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('✅ Pool de conexiones creado');

module.exports = pool;