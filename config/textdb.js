const mysql = require('mysql2/promise');

async function testConexion() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'trabajadores_servicio'
        });

        console.log('✅ ¡Conectado a la base de datos!');

        const [rows] = await db.query('SELECT * FROM trabajador');
        console.log('📄 Filas obtenidas:', rows);

        await db.end(); // Cerramos la conexión
        console.log('🔒 Conexión cerrada');
    } catch (error) {
        console.error('❌ Error en la conexión o consulta:', error);
    }
}

testConexion();