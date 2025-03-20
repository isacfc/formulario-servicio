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

app.get('/success', (req, res) => {
    res.render('success', { error: null });
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

function convertirFecha(fechaDDMMYYYY) {
    const partes = fechaDDMMYYYY.split("-");
    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2];
    return `${anio}-${mes}-${dia}`; // Devuelve formato YYYY-MM-DD
}




// Ruta para guardar datos
app.post('/guardar', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
   
    

    const { sexo, papa, embarazo,  cantidadHijos } = req.body;
    const { idTrabajador } = req.session.user;

    const query = 'UPDATE trabajador SET sexo = ?, es_padre_madre=? , embarazada=?, cantidadHijos = ? WHERE idTrabajador = ?';

    /*
    try {
        // Espera a que termine el query
        const [result] = await db.query(query, [sexo, papa, embarazo, cantidadHijos, idTrabajador]);

        console.log('✅ Actualización exitosa:', result);

        res.redirect('/index');
    } catch (err) {
        console.error('❌ Error al guardar:', err);
        res.send('Error al guardar');
    }*/

    try {
        const [result] = await db.query(query, [sexo, papa, embarazo, cantidadHijos, idTrabajador]);
        console.log('✅ Actualización exitosa:', result);

        // Si se ingresaron datos de hijos, los insertamos
        if (cantidadHijos && cantidadHijos > 0) {
            // (Opcional: podrías borrar registros anteriores de hijos para ese trabajador, si se requiere)
            for (let i = 0; i < cantidadHijos; i++) {
                // Extraemos cada dato dinámico. Asegúrate que en el form los inputs tengan nombres: 
                // inicialesHijo0, fechaNacimientoHijo0, edadHijo0, etc.
                const iniciales = req.body[`inicialesHijo${i}`];
                const fechaNacimiento = req.body[`fechaNacimientoHijo${i}`];
                const edad = req.body[`edadHijo${i}`];

                
                
                const fechaFormateada = convertirFecha(fechaNacimiento);

                // Ahora guarda en MySQL usando fechaFormateada


                // Consulta para insertar cada hijo. Se asume que la tabla se llama "hijo" y tiene las columnas:
                // id (auto-increment), idTrabajador, iniciales, fechaNacimiento y edad.
                const queryChild = 'INSERT INTO hijo (iniciales, fechaNacimiento, edad, idTrabajador) VALUES (?, ?, ?, ?)';
                const [childResult] = await db.query(queryChild, [iniciales, fechaFormateada, edad, idTrabajador]);
                console.log(`✅ Hijo ${i + 1} guardado:`, childResult);
            }
        }

        res.redirect('/success');
    } catch (err) {
        console.error('❌ Error al guardar:', err);
        res.send('Error al guardar');
    }
});


app.post('/login', async (req, res) => {
    console.log('🚀 Entró al POST /login');

    const { rfc,curp } = req.body;
    console.log('RFC recibido:', rfc);

    try {
        console.log('🔍 Antes del query');

        const [results] = await db.query('SELECT * FROM trabajador WHERE rfc = ? AND curp = ?', [rfc,curp]);

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
