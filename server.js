const express = require('express');
const bodyParser = require('body-parser'); // Leer y entender los datos del formulario
const db = require('./config/db'); // Ahora es el pool

const app = express(); //Crear una aplicación express
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const session = require('express-session');

const multer = require('multer');
const uploadPath = path.join(__dirname, 'uploads');

// Crear carpeta si no existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configurar multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const noTrabajador = req.session?.user?.noTrabajador || 'desconocido';
    const nombreLimpio = file.fieldname + '-' +noTrabajador + ext;
    cb(null, nombreLimpio);
  }
});

const upload = multer({ storage });


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
        return res.redirect('/login');
    }
    res.render('index', { user: req.session.user });
});

app.get('/success', (req, res) => {
    res.render('success');
});


app.get('/insert', (req, res) => {
    res.render('insert', { error: null });
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.status(200).send('Sesión cerrada');
    });
});

function convertirFecha(fechaDDMMYYYY) {
    const partes = fechaDDMMYYYY.split("-");
    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2];
    return `${anio}-${mes}-${dia}`; // Devuelve formato YYYY-MM-DD
}

function formatearFecha(fecha) {
    if (!fecha || fecha === '0000-00-00') {
        return 'N/A';  // O puedes poner simplemente ''
    }

    // Si es un objeto Date, lo formateamos
    const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-MX', opciones);

    // Pone la primera letra de mes en mayúscula (por si acaso)
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
}


function convertirFechaTexto(fechaInput) {
    if (!fechaInput) return null; // Si está vacío, no hagas nada

    const [mes, anio] = fechaInput.split('-');
    
    const nombresMeses = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const mesIndex = parseInt(mes, 10) - 1; // Porque los arrays empiezan en 0
    if (mesIndex < 0 || mesIndex > 11) return null; // Validación simple

    return `${nombresMeses[mesIndex]} ${anio}`;
}

function mesAnioAFechaOrdenable(fechaMMYYYY) {
    if (!fechaMMYYYY) return null;
    const [mes, anio] = fechaMMYYYY.split("-");
    return new Date(`${anio}-${mes}-01`); // YYYY-MM-DD
}



// Ruta para guardar datos

app.post('/guardar', upload.fields([
  { name: 'ine_pdf', maxCount: 1 },
  { name: 'acta_pdf', maxCount: 1 },
  { name: 'comprobante_domicilio_pdf', maxCount: 1 },
  { name: 'comprobante_fiscal_pdf', maxCount: 1 }
]), async (req, res) => {

    if (!req.session.user) {
        return res.redirect('/login');
    }
   
    const ineFile = req.files['ine_pdf']?.[0];
    const actaFile = req.files['acta_pdf']?.[0];
    const domicilioFile = req.files['comprobante_domicilio_pdf']?.[0];
    const fiscalFile = req.files['comprobante_fiscal_pdf']?.[0];


    const { telefono,fechaIngreso,adscripcionActual,cargoActual, sexo,fechaNacimiento,lugarNacimiento,codigopostal,correo, papa, embarazo,  cantidadHijos, cronica,civil,sangre,telefonocasa,telefonofamiliar,parentesco,primaria,secundaria_institucion } = req.body;
    const { idTrabajador } = req.session.user;


    const callenumero = req.body.callenumero.toUpperCase();
    const colonia = req.body.colonia.toUpperCase();
    const municipio = req.body.municipio.toUpperCase();
    const estado = req.body.estado.toUpperCase();
    

    console.log("Papa: " + papa + " y " + sexo);
    let cronicaTexto = req.body.cronicaTexto;
    let nombreConyuge = req.body.nombreConyuge;
    let fechaConyuge = req.body.fechaConyuge;
    let sexoConyuge = req.body.sexoConyuge;

    let tieneCronica;
    let padre;
    let embarazada;

    let carreraTecnica = req.body.tecnica_institucion;
    const query = 'UPDATE trabajador SET  fechaIngreso=?, adscripcionActual=?,cargoActual=?,sexoTrabajador = ?,fechaNacimiento=?,lugarNacimiento=?,estadoCivil=?,nombreConyuge=?,fechaNacimientoConyuge=?,sexoConyuge=?,tipoSangre=?,calleNumero=?,colonia=?,municipio=?,estado=?,codigoPostal=?,  noTelefono = ?,telefonoCasa=?,telefonoFamiliar=?,parentescoFamiliar=?, correoElectronico=?,tieneEnfermedadCronica=?,tipoCronica=?, es_padre_madre=? , embarazada = ?, cantidadHijos = ?,primaria=?,secundaria=?, carreraTecnicaComercial=? WHERE idTrabajador = ?';
    
    if ( papa == 1 && sexo == "Femenino"){

        padre="Madre";

    } else if ( papa == 1 && sexo == "Masculino"){
        padre="Padre";
    }else{
        padre="No";
    }

    if(cronica ==1){
        tieneCronica = "Si";
    }
    else{
        tieneCronica="No";
    }

    if( cronica == 0){
        cronicaTexto = "N/A";
    }
    


    if( embarazo == 1 && sexo == "Femenino"){
        embarazada = "Embarazada";
    }
    else if (sexo == "Masculino"){
        embarazada = "No aplica";
    } else {
        embarazada = "No";
    }

    if (civil!="Casado/a"){
        nombreConyuge="N/A";
        fechaConyuge="00-00-0000";
        sexoConyuge="N/A";
         
    }


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
        const fechaFormateada = convertirFecha(fechaConyuge);
        const fechaIngresoFormateada = convertirFecha(fechaIngreso);
        const fechaNacimientoFormateada = convertirFecha(fechaNacimiento);
        const [result] = await db.query(query, [fechaIngresoFormateada,adscripcionActual,cargoActual,sexo,fechaNacimientoFormateada,lugarNacimiento,civil,nombreConyuge,fechaFormateada,sexoConyuge,sangre,callenumero,colonia,municipio,estado,codigopostal,telefono,telefonocasa,telefonofamiliar,parentesco,correo,tieneCronica,cronicaTexto, padre, embarazada, cantidadHijos,primaria,secundaria_institucion, carreraTecnica, idTrabajador]);
        console.log('✅ Actualización exitosa:', result);


        const deleteQuery = 'DELETE FROM hijo WHERE idTrabajador = ?';
        await db.query(deleteQuery, [idTrabajador]);
        console.log(`🗑️ Hijos anteriores eliminados para trabajador ${idTrabajador}`);

        // Si se ingresaron datos de hijos, los insertamos
        if (cantidadHijos && cantidadHijos > 0) {
            // (Opcional: podrías borrar registros anteriores de hijos para ese trabajador, si se requiere)
            for (let i = 0; i < cantidadHijos; i++) {
                // Extraemos cada dato dinámico. Asegúrate que en el form los inputs tengan nombres: 
                // inicialesHijo0, fechaNacimientoHijo0, edadHijo0, etc.
                let iniciales = req.body[`inicialesHijo${i}`];
                const sexo = req.body[`selectHijo${i}`];
                const fechaNacimiento = req.body[`fechaNacimientoHijo${i}`];
                const edad = req.body[`edadHijo${i}`];

                iniciales = iniciales.toUpperCase(); // Mayúsculas
                iniciales = iniciales.replace(/[^A-Z]/g, ""); // Quitar todo excepto letras mayúsculas
        
                
                const fechaFormateada = convertirFecha(fechaNacimiento);

                // Ahora guarda en MySQL usando fechaFormateada


                // Consulta para insertar cada hijo. Se asume que la tabla se llama "hijo" y tiene las columnas:
                // id (auto-increment), idTrabajador, iniciales, fechaNacimiento y edad.
                const queryChild = 'INSERT INTO hijo (inicialesHijo,sexoHijo, fechaNacimientoHijo, edadHijo, idTrabajador) VALUES (?, ?,?, ?, ?)';
                const [childResult] = await db.query(queryChild, [iniciales,sexo, fechaFormateada, edad, idTrabajador]);
                console.log(`✅ Hijo ${i + 1} guardado:`, childResult);
            }
        }
        const deleteQuery2 = 'DELETE FROM escolaridad WHERE idTrabajador = ?';
        await db.query(deleteQuery2, [idTrabajador]);
        console.log(`Escolaridad eliminada para trabajador ${idTrabajador}`);

        const escolaridades = [
            // BACHILLERATO
            {
                nivel: "BACHILLERATO",
                titulo: req.body.prepa_titulo || null,
                fecha: req.body.prepa_fecha ? convertirFechaTexto(req.body.prepa_fecha) : null,
                institucion: req.body.prepa_institucion || null,
                documento: req.body.prepa_documento || null,
                estatus: req.body.prepa_estatus || null,
                cedula: null
            },

            // LICENCIATURAS (hasta 3)
            {
                nivel: "LICENCIATURA",
                titulo: req.body.licenciatura_titulo1 || null,
                fecha: req.body.licenciatura_fecha1 ? convertirFechaTexto(req.body.licenciatura_fecha1) : null,
                institucion: req.body.licenciatura_institucion1 || null,
                documento: req.body.licenciatura_documento1 || null,
                estatus: req.body.licenciatura_estatus1 || null,
                cedula: req.body.licenciatura_cedula1 || null
            },
            {
                nivel: "LICENCIATURA",
                titulo: req.body.licenciatura_titulo2 || null,
                fecha: req.body.licenciatura_fecha2 ? convertirFechaTexto(req.body.licenciatura_fecha2) : null,
                institucion: req.body.licenciatura_institucion2 || null,
                documento: req.body.licenciatura_documento2 || null,
                estatus: req.body.licenciatura_estatus2 || null,
                cedula: req.body.licenciatura_cedula2 || null
            },
            {
                nivel: "LICENCIATURA",
                titulo: req.body.licenciatura_titulo3 || null,
                fecha: req.body.licenciatura_fecha3 ? convertirFechaTexto(req.body.licenciatura_fecha3) : null,
                institucion: req.body.licenciatura_institucion3 || null,
                documento: req.body.licenciatura_documento3 || null,
                estatus: req.body.licenciatura_estatus3 || null,
                cedula: req.body.licenciatura_cedula3 || null
            },

            // MAESTRÍAS
            {
                nivel: "MAESTRIA",
                titulo: req.body.maestria_titulo1 || null,
                fecha: req.body.maestria_fecha1 ? convertirFechaTexto(req.body.maestria_fecha1) : null,
                institucion: req.body.maestria_institucion1 || null,
                documento: req.body.maestria_documento1 || null,
                estatus: req.body.maestria_estatus1 || null,
                cedula: req.body.maestria_cedula1 || null
            },
            {
                nivel: "MAESTRIA",
                titulo: req.body.maestria_titulo2 || null,
                fecha: req.body.maestria_fecha2 ? convertirFechaTexto(req.body.maestria_fecha2) : null,
                institucion: req.body.maestria_institucion2 || null,
                documento: req.body.maestria_documento2 || null,
                estatus: req.body.maestria_estatus2 || null,
                cedula: req.body.maestria_cedula2 || null
            },
            {
                nivel: "MAESTRIA",
                titulo: req.body.maestria_titulo3 || null,
                fecha: req.body.maestria_fecha3 ? convertirFechaTexto(req.body.maestria_fecha3) : null,
                institucion: req.body.maestria_institucion3 || null,
                documento: req.body.maestria_documento3 || null,
                estatus: req.body.maestria_estatus3 || null,
                cedula: req.body.maestria_cedula3 || null
            },

            // ESPECIALIDADES
            {
                nivel: "ESPECIALIDAD",
                titulo: req.body.especialidad_titulo1 || null,
                fecha: req.body.especialidad_fecha1 ? convertirFechaTexto(req.body.especialidad_fecha1) : null,
                institucion: req.body.especialidad_institucion1 || null,
                documento: req.body.especialidad_documento1 || null,
                estatus: req.body.especialidad_estatus1 || null,
                cedula: req.body.especialidad_cedula1 || null
            },
            {
                nivel: "ESPECIALIDAD",
                titulo: req.body.especialidad_titulo2 || null,
                fecha: req.body.especialidad_fecha2 ? convertirFechaTexto(req.body.especialidad_fecha2) : null,
                institucion: req.body.especialidad_institucion2 || null,
                documento: req.body.especialidad_documento2 || null,
                estatus: req.body.especialidad_estatus2 || null,
                cedula: req.body.especialidad_cedula2 || null
            },
            {
                nivel: "ESPECIALIDAD",
                titulo: req.body.especialidad_titulo3 || null,
                fecha: req.body.especialidad_fecha3 ? convertirFechaTexto(req.body.especialidad_fecha3) : null,
                institucion: req.body.especialidad_institucion3 || null,
                documento: req.body.especialidad_documento3 || null,
                estatus: req.body.especialidad_estatus3 || null,
                cedula: req.body.especialidad_cedula3 || null
            },

            // DOCTORADOS
            {
                nivel: "DOCTORADO",
                titulo: req.body.doctorado_titulo1 || null,
                fecha: req.body.doctorado_fecha1 ? convertirFechaTexto(req.body.doctorado_fecha1) : null,
                institucion: req.body.doctorado_institucion1 || null,
                documento: req.body.doctorado_documento1 || null,
                estatus: req.body.doctorado_estatus1 || null,
                cedula: req.body.doctorado_cedula1 || null
            },
            {
                nivel: "DOCTORADO",
                titulo: req.body.doctorado_titulo2 || null,
                fecha: req.body.doctorado_fecha2 ? convertirFechaTexto(req.body.doctorado_fecha2) : null,
                institucion: req.body.doctorado_institucion2 || null,
                documento: req.body.doctorado_documento2 || null,
                estatus: req.body.doctorado_estatus2 || null,
                cedula: req.body.doctorado_cedula2 || null
            }
            ];

          
        // Recorremos cada escolaridad y guardamos solo si tienen algún dato real
        for (let escolaridad of escolaridades) {
        console.log(escolaridad.fecha);
        const hayDatos = escolaridad.titulo || escolaridad.fecha || escolaridad.institucion;
        
        if (hayDatos) {
            const insertQuery = `
            INSERT INTO escolaridad (
                nivelAcademico, nombreTitulo, fechaObtencion,
                institucion, documentoAdquirido, estatus, cedulaProfesional,idTrabajador
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
        
            await db.query(insertQuery, [
                // Asegúrate de tener el idTrabajador después de insertar en trabajador
            escolaridad.nivel,
            escolaridad.titulo,
            escolaridad.fecha,
            escolaridad.institucion,
            escolaridad.documento,
            escolaridad.estatus,
            escolaridad.cedula,
            idTrabajador
            ]);
        
            console.log(`✅ Escolaridad ${escolaridad.nivel} guardada`);
        }
        }

         const deleteQuery4 = 'DELETE FROM actualizacionprofesional WHERE idTrabajador = ?';
        await db.query(deleteQuery4, [idTrabajador]);

        let actualizaciones = [];
        for (let i = 0; i < 11; i++) {
        const tema = req.body[`actualizacion_tema${i}`];
        const fecha = req.body[`actualizacion_fecha${i}`];
        const institucion = req.body[`actualizacion_institucion${i}`];
        const documento = req.body[`actualizacion_documento${i}`];

        const hayDatos = tema || fecha || institucion || documento;

        if (hayDatos) {
            actualizaciones.push({ tema, fecha, institucion, documento });
        }
        }

        // Paso 2: ordenar por fecha descendente
        actualizaciones.sort((a, b) => {
        const fa = new Date(convertirFecha(a.fecha));
        const fb = new Date(convertirFecha(b.fecha));
        return fb - fa; // descendente
        });

        // Paso 3: insertar ya ordenado
        for (let act of actualizaciones) {
        const fechaConvertida = act.fecha ? convertirFecha(act.fecha) : null;

        await db.query(
            `INSERT INTO actualizacionprofesional (tema, fecha, institucion, documento, idTrabajador)
            VALUES (?, ?, ?, ?, ?)`,
            [act.tema, fechaConvertida, act.institucion, act.documento, idTrabajador]
        );
        }




        const deleteQuery3 = 'DELETE FROM experienciapj WHERE idTrabajador = ?';
        await db.query(deleteQuery3, [idTrabajador]);
        cantidadExpPJ = req.body["experienciaTotal"];

        if (cantidadExpPJ && cantidadExpPJ > 0) {
            let experiencias = [];

            for (let i = 0; i < cantidadExpPJ; i++) {
                const rawInicio = req.body[`experiencia_inicio${i}`]; // ej. "05-2023"
                const rawFin = req.body[`experiencia_fin${i}`];       // ej. "08-2024"
                let institucion = req.body[`experiencia_institucion${i}`];
                let adscripcion = req.body[`experiencia_adscripcion${i}`];
                const puesto = req.body[`experiencia_puesto${i}`];
                const campo = req.body[`experiencia_campo${i}`];

                if (institucion === "OTRA") {
                    adscripcion = "";
                    institucion = req.body[`experiencia_otrainst${i}`];
                } else {
                    institucion = "PODER JUDICIAL DEL ESTADO DE HIDALGO";
                }

                // Convertimos fechas para ordenar correctamente
                const fechaOrdenable = (mesY) => {
                    if (!mesY || typeof mesY !== "string") return new Date(0); // valor mínimo
                    const [mes, anio] = mesY.split("-");
                    return new Date(parseInt(anio), parseInt(mes) - 1);
                };

                experiencias.push({
                    inicioTexto: rawInicio,
                    finTexto: rawFin,
                    inicioOrden: fechaOrdenable(rawInicio),
                    finOrden: fechaOrdenable(rawFin),
                    institucion,
                    adscripcion,
                    puesto,
                    campo
                });
            }

            // Ordenar por fecha de fin descendente
            experiencias.sort((a, b) => b.finOrden - a.finOrden);

            for (let exp of experiencias) {
                await db.query(
                    `INSERT INTO experienciapj (periodoInicio, periodoFin, institucion, adscripcion, cargo, campoExperiencia, idTrabajador)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        convertirFechaTexto(exp.inicioTexto),
                        convertirFechaTexto(exp.finTexto),
                        exp.institucion,
                        exp.adscripcion,
                        exp.puesto,
                        exp.campo,
                        idTrabajador
                    ]
                );
                console.log(`✅ Experiencia insertada: ${exp.puesto}`);
            }
        }


        // Destruir la sesión y redirigir
        req.session.destroy(() => {
            console.log("✅ Sesión destruida");
            res.redirect('/success');
        });

    } catch (err) {
        console.error('❌ Error al guardar:', err);
        res.send('Error al guardar');
    }
});


app.post('/login', async (req, res) => {
    console.log('🚀 Entró al POST /login');

    const rfc = req.body.rfc.toUpperCase();
    const curp = req.body.curp.toUpperCase();

    console.log('RFC recibido:', rfc);


    try {
        console.log('🔍 Antes del query');

        const [results] = await db.query('SELECT * FROM trabajador WHERE rfc = ? AND curp = ?', [rfc,curp]);

        console.log('✅ Después del query');
        console.log('Resultado de la consulta:', results);

        if (results.length === 0) {
            console.log("Intento de sesión, no encontrado: " + rfc);
            return res.send(`
                <script>
                  alert('El RFC o el CURP no se han encontrado. Revise e intentelo de nuevo. SI el problema persiste, contacta al area de Recursos Humanos del Poder Judicial del Estado de Hidalgo');
                  window.location.href = '/login'; // Redirige de nuevo al login
                </script>
              `);

            
        }

        console.log('✅ RFC encontrado:', results[0]);
        req.session.user = results[0];
        return res.redirect('/index');

    } catch (err) {
        console.error('❌ Error en el query:', err);
        return res.send('Error consultando la base');
    }
});

function calcularEdad(fechaNacimientoStr) {
    const nacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
                         
    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }
    return edad;
  }


app.get('/reporte/:noTrabajador', async (req, res) => {
    const noTrabajador = req.params.noTrabajador;
    
    const rutaPlantilla = './plantillas/CEDULA PERSONAL DATOS.xlsx';

    try {
        
        const [trabajadorRows] = await db.query('SELECT * FROM trabajador WHERE noTrabajador = ?', [noTrabajador]);
        const trabajador = trabajadorRows[0];
        const idTrabajador = trabajador.idTrabajador;

        if (!trabajador) {
            return res.status(404).send('No se encontró el trabajador');
        }

       
        const [hijos] = await db.query('SELECT * FROM hijo WHERE idTrabajador = ?', [idTrabajador]);

        
        const [escolaridades] = await db.query('SELECT * FROM escolaridad WHERE idTrabajador = ?', [idTrabajador]);

         const [actualizaciones] = await db.query('SELECT * FROM actualizacionprofesional WHERE idTrabajador = ?', [idTrabajador]);
        ///const [experiencias] = await db.query('SELECT * FROM experienciapj WHERE idTrabajador = ?', [idTrabajador]);

        ///console.log(experiencias)

        const [experiencias] = await db.query('SELECT * FROM experienciapj WHERE idTrabajador = ?', [idTrabajador]);

        console.log('Resultados:', experiencias);
        console.log('Total:', experiencias.length);
        console.log('ID del trabajador recibido:', idTrabajador);


        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(rutaPlantilla);
        const worksheet = workbook.getWorksheet(1); // Hoja 1

        worksheet.getCell('F7').value = formatearFecha(trabajador.fechaIngreso);
        worksheet.getCell('F8').value = trabajador.adscripcionActual;
        worksheet.getCell('F9').value = trabajador.cargoActual;


        worksheet.getCell('B11').value = trabajador.nombreTrabajador;
        worksheet.getCell('B13').value = formatearFecha(trabajador.fechaNacimiento);
        worksheet.getCell('B12').value = trabajador.lugarNacimiento;
        worksheet.getCell('B14').value = trabajador.estadoCivil;
        worksheet.getCell('B15').value = trabajador.tipoSangre;
        worksheet.getCell('B16').value = trabajador.tipoCronica;

        if (trabajador.nombreConyuge != "N/A"){
            worksheet.getCell('A19').value = trabajador.nombreConyuge;
            worksheet.getCell('C19').value = formatearFecha(trabajador.fechaNacimientoConyuge);///trabajador.fechaNacimientoConyuge ? trabajador.fechaNacimientoConyuge.toString() : '';
            worksheet.getCell('D19').value = calcularEdad(trabajador.fechaNacimientoConyuge);
            worksheet.getCell('E19').value = trabajador.sexoConyuge;
        }
        
       
        const direccionCompleta = `${trabajador.calleNumero}, ${trabajador.colonia}, ${trabajador.municipio}, ${trabajador.estado}, C.P. ${trabajador.codigoPostal}`;

        worksheet.getCell('B36').value = direccionCompleta;

        worksheet.getCell('B39').value = trabajador.noTelefono;
        worksheet.getCell('B40').value = trabajador.telefonoCasa;
        worksheet.getCell('B41').value = trabajador.telefonoFamiliar;
        worksheet.getCell('F41').value = trabajador.parentescoFamiliar;
        worksheet.getCell('B42').value = trabajador.correoElectronico;

        worksheet.getCell('B47').value = trabajador.primaria;
        worksheet.getCell('B48').value = trabajador.secundaria;
        worksheet.getCell('B49').value = trabajador.carreraTecnicaComercial;

        const bachillerato = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "BACHILLERATO"
          );

        bachillerato.forEach((exp, index) => {
            const fila = 51 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
        });

        /*const licenciatura = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "LICENCIATURA"
          );

          

        licenciatura.forEach((exp, index) => {
            const fila = 52 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
            worksheet.getCell(`G${fila}`).value = exp.cedulaProfesional;
        });*/

        const licenciaturas = escolaridades.filter(
        exp => exp.nivelAcademico.toUpperCase() === "LICENCIATURA"
        );

        licenciaturas.forEach((exp, index) => {
            const fila = 52 + index;
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
            worksheet.getCell(`G${fila}`).value = exp.cedulaProfesional;    
        });
      


        const especialidad = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "ESPECIALIDAD"
          );

        especialidad.forEach((exp, index) => {
            const fila = 60 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
            worksheet.getCell(`G${fila}`).value = exp.cedulaProfesional;
        });

        const maestria = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "MAESTRIA"
          );

        maestria.forEach((exp, index) => {
            const fila = 55 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
            worksheet.getCell(`G${fila}`).value = exp.cedulaProfesional;
        });

        const doctorado = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "DOCTORADO"
          );

        doctorado.forEach((exp, index) => {
        const fila = 58 + index; // Ejemplo: empieza en fila 40
        worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
        worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
        worksheet.getCell(`D${fila}`).value = exp.institucion;
        worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
        worksheet.getCell(`F${fila}`).value = exp.estatus;
        worksheet.getCell(`G${fila}`).value = exp.cedulaProfesional;
        });
     

        

        // 👶 Hijos (hasta 10 como máximo)
        hijos.forEach((hijo, index) => {
            const fila = 23 + index; // Ejemplo: empieza en fila 20
            worksheet.getCell(`A${fila}`).value = hijo.inicialesHijo;
            worksheet.getCell(`C${fila}`).value = formatearFecha(hijo.fechaNacimientoHijo);
            worksheet.getCell(`D${fila}`).value = hijo.edadHijo;
            worksheet.getCell(`E${fila}`).value = hijo.sexoHijo;
            
            
        });

        actualizaciones.forEach((exp, index) => {
            const fila = 69 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`A${fila}`).value = exp.tema;
            worksheet.getCell(`B${fila}`).value = formatearFecha(exp.fecha);
            worksheet.getCell(`C${fila}`).value = exp.institucion;
            worksheet.getCell(`F${fila}`).value = exp.documento;
        });

        const experienciasPJ = experiencias.filter(
            exp => exp.institucion.toUpperCase() === "PODER JUDICIAL DEL ESTADO DE HIDALGO"
          );

        //  Experiencia PJ
        experienciasPJ.forEach((exp, index) => {
            const fila = 81 + index; // Ejemplo: empieza en fila 40
            worksheet.getCell(`A${fila}`).value = exp.periodoInicio;
            worksheet.getCell(`B${fila}`).value = exp.periodoFin;
            worksheet.getCell(`C${fila}`).value = exp.adscripcion;
            worksheet.getCell(`F${fila}`).value = exp.cargo;
        });

        // Guardar y enviar el archivo
        const rutaSalida = './reportes/';
        const nombreArchivo = `cedula_${trabajador.noTrabajador}.xlsx`;
        const rutaCompleta = path.join(rutaSalida, nombreArchivo);

        await workbook.xlsx.writeFile(rutaCompleta);

        const archiver = require('archiver');

        // Crear el archivo ZIP
        const zipNombre = `reporte_${trabajador.noTrabajador}.zip`;
        const zipRuta = path.join('./reportes', zipNombre);
        const output = fs.createWriteStream(zipRuta);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`📦 ZIP creado con ${archive.pointer()} bytes`);
            res.download(zipRuta, (err) => {
                if (err) {
                    console.error('Error al enviar ZIP:', err);
                } else {
                    fs.unlinkSync(zipRuta); // Limpieza después de enviar
                    fs.unlinkSync(rutaCompleta); // Elimina el Excel temporal también
                }
            });
        });

        archive.on('error', err => {
            throw err;
        });

        archive.pipe(output);

        // Adjunta el Excel generado
        archive.file(rutaCompleta, { name: path.basename(rutaCompleta) });

        // Archivos PDF
        const uploadsPath = path.join(__dirname, 'uploads');
        const pdfs = [
            `ine_pdf-${trabajador.noTrabajador}.pdf`,
            `acta_pdf-${trabajador.noTrabajador}.pdf`,
            `comprobante_domicilio_pdf-${trabajador.noTrabajador}.pdf`,
            `comprobante_fiscal_pdf-${trabajador.noTrabajador}.pdf`
        ];

        pdfs.forEach(nombre => {
            const ruta = path.join(uploadsPath, nombre);
            if (fs.existsSync(ruta)) {
                archive.file(ruta, { name: nombre });
            }
        });

        await archive.finalize();

    } catch (error) {
        console.error('Error generando el reporte:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Puerto
app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001/login');
});






