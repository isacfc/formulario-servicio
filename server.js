const express = require('express');
const bodyParser = require('body-parser'); // Leer y entender los datos del formulario
const db = require('./config/db'); // Ahora es el pool

const app = express(); //Crear una aplicación express


const session = require('express-session');


app.use(express.static('public')); // Es donde esta guardado mi CSS, imágenes, etc.
app.use(bodyParser.urlencoded({ extended: false })); //decodificar la url de como llegan los datos
app.use(bodyParser.json()); //permitir decodificar archivos json

app.set('view engine', 'ejs');



app.use(session({
    secret: 'Vr#Rno@jyc%j5Kckh978SM', // Llave unica de la sesión
    resave: false,
    saveUninitialized: false
}));






app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.get('/index', (req, res) => {
    if (!req.session.user) {
        // Si no ha iniciado sesión, lo mandamos al login
        return res.redirect('/login');
    }

    res.render('index', { user: req.session.user });
});

app.get('/', (req, res) => {
    res.redirect('/login');
});



// Ruta para guardar datos
app.post('/guardar', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { sexo, papa, cantidadHijos } = req.body;
    const { id } = req.session.user;

    const query = 'UPDATE trabajador SET sexo = ?, es_padre_madre = ?, cantidad_hijos = ? WHERE idTrabajador = ?';

    try {
        // Esperamos a que termine el query
        const [result] = await db.query(query, [sexo, papa, cantidadHijos, id]);

        console.log('✅ Actualización exitosa:', result);

        res.redirect('/index');
    } catch (err) {
        console.error('❌ Error al guardar:', err);
        res.send('Error al guardar');
    }
});


app.post('/login', async (req, res) => {
    console.log('🚀 Entró al POST /login');

    const { rfc } = req.body;
    console.log('RFC recibido:', rfc);

    try {
        console.log('🔍 Antes del query');

        const [results] = await db.query('SELECT * FROM trabajador WHERE rfc = ?', [rfc]);

        console.log('✅ Después del query');
        console.log('Resultado de la consulta:', results);

        if (results.length === 0) {
            console.log('⚠️ RFC no encontrado');
            return res.render('login', { error: 'RFC no encontrado' });
        }

        console.log('✅ RFC encontrado:', results[0]);
        req.session.user = results[0];
        return res.redirect('/index');

    } catch (err) {
        console.error('❌ Error en el query:', err);
        return res.send('Error consultando la base');
    }
});

// Puerto
app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001/login');
});
