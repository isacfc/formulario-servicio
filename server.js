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

app.get('/buscador', (req, res) => {
  res.render('buscador'); // si usas EJS
});

app.get('/existe/:noTrabajador', async (req, res) => {
  const noTrabajador = req.params.noTrabajador;

  try {
    const [result] = await db.query('SELECT COUNT(*) AS total FROM trabajador WHERE noTrabajador = ?', [noTrabajador]);
    const existe = result[0].total > 0;
    res.json({ existe });
  } catch (error) {
    console.error("Error al verificar trabajador:", error);
    res.status(500).json({ error: 'Error interno' });
  }
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


    const { telefono,fechaIngreso,adscripcionActual, lenguaSenias,sexo,fechaNacimiento,municipioNacimiento,estadoNacimiento,codigopostal,correo, papa, embarazo,  cantidadHijos, cronica,civil,sangre,telefonocasa,telefonofamiliar,parentesco,primaria,secundaria_institucion } = req.body;
    const { idTrabajador } = req.session.user;

    const lugarNacimiento = `${municipioNacimiento.trim().toUpperCase()}, ${estadoNacimiento.trim().toUpperCase()}`;

    let cargoActual = req.body.cargoActual;

    if (cargoActual === "Otro") {
        cargoActual = req.body.otroCargo?.trim().toUpperCase() || "OTRO";
    }

    const callenumero = req.body.callenumero.toUpperCase();
    const colonia = req.body.colonia.toUpperCase();
    const municipio = req.body.municipio.toUpperCase();
    const estado = req.body.estado.toUpperCase();

    let actualCallenumero = req.body.actual_callenumero || callenumero;
    let actualColonia = req.body.actual_colonia || colonia;
    let actualMunicipio = req.body.actual_municipio || municipio;
    let actualEstado = req.body.actual_estado || estado;
    let actualCP = req.body.actual_codigopostal || codigopostal;
    

    console.log("Papa: " + papa + " y " + sexo);
    let cronicaTexto = req.body.cronicaTexto;
    let nombreConyuge = req.body.nombreConyuge;
    let fechaConyuge = req.body.fechaConyuge;
    let sexoConyuge = req.body.sexoConyuge;

    let tieneCronica;
    let padre;
    let embarazada;

    
    const comunidadIndigena = req.body.indigena === '1'
    ? req.body.comunidadIndigena?.trim().toUpperCase() || 'N/A'
    : 'N/A';

    const familiaLinguistica = req.body.hablaLenguaIndigena === '1'
    ? req.body.familiaLinguistica?.trim().toUpperCase() || 'N/A'
    : 'N/A';

    
    const tipoDiscapacidad = req.body.discapacidad === '1'
    ? req.body.tipoDiscapacidad?.trim().toUpperCase() || 'NO ESPECIFICADA'
    : 'N/A';

    ///let carreraTecnica = req.body.tecnica_institucion;

    const tieneTecnica = req.body.tieneTecnica === '1';
    const carreraTecnicaComercial = tieneTecnica
    ? req.body.tecnica_institucion.trim().toUpperCase()
    : 'No';

    const tieneBachillerato = req.body.tieneBachillerato === '1';
    const prepaTitulo       = tieneBachillerato
    ? req.body.prepa_titulo.trim().toUpperCase()
    : null;
    const prepaFecha        = tieneBachillerato
    ? convertirFechaTexto(req.body.prepa_fecha)
    : null;
    const prepaInst         = tieneBachillerato
    ? req.body.prepa_institucion.trim().toUpperCase()
    : null;
    const prepaDocumento    = tieneBachillerato
    ? req.body.prepa_documento
    : null;
    const prepaEstatus      = tieneBachillerato
    ? req.body.prepa_estatus
    : null;


    const query = 'UPDATE trabajador SET  fechaIngreso=?, adscripcionActual=?,cargoActual=?,sexoTrabajador = ?,fechaNacimiento=?,lugarNacimiento=?,estadoCivil=?,nombreConyuge=?,fechaNacimientoConyuge=?,sexoConyuge=?,tipoSangre=?,calleNumero=?,colonia=?,municipio=?,estado=?,codigoPostal=?,actualCalleNumero=?,actualColonia=?,actualMunicipio=?,actualEstado=?, actualCP=?,  noTelefono = ?,telefonoCasa=?,telefonoFamiliar=?,parentescoFamiliar=?, correoElectronico=?,comunidadIndigena=?,familiaLinguistica=?,tipoDiscapacidad=?,lenguajeSenias=?,tieneEnfermedadCronica=?,tipoCronica=?, es_padre_madre=? , embarazada = ?, cantidadHijos = ?,primaria=?,secundaria=?, carreraTecnicaComercial=? WHERE idTrabajador = ?';
    
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
        const [result] = await db.query(query, [fechaIngresoFormateada,adscripcionActual,cargoActual,sexo,fechaNacimientoFormateada,lugarNacimiento,civil,nombreConyuge,fechaFormateada,sexoConyuge,sangre,callenumero,colonia,municipio,estado,codigopostal,actualCallenumero,actualColonia, actualMunicipio, actualEstado, actualCP, telefono,telefonocasa,telefonofamiliar,parentesco,correo,comunidadIndigena,familiaLinguistica,tipoDiscapacidad,lenguaSenias,tieneCronica,cronicaTexto, padre, embarazada, cantidadHijos,primaria,secundaria_institucion, carreraTecnicaComercial, idTrabajador]);
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


        // Después de eliminar las filas antiguas:
        await db.query('DELETE FROM escolaridad WHERE idTrabajador = ?', [idTrabajador]);

        // Define tus niveles y máximos permitidos
        const niveles      = ['licenciatura', 'maestria', 'doctorado', 'posdoctorado', 'especialidad'];
        const maximos      = { licenciatura: 3, maestria: 3, doctorado: 2, posdoctorado:2, especialidad: 3 };

        // Prepara tu INSERT
        const insertQuery = `
        INSERT INTO escolaridad
            (nivelAcademico, nombreTitulo, fechaObtencion, institucion,
            documentoAdquirido, estatus, cedulaProfesional, idTrabajador)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        if (req.body.tieneBachillerato === '1') {
        await db.query(insertQuery, [
            "BACHILLERATO",
            req.body.prepa_titulo.trim().toUpperCase(),
            convertirFecha(req.body.prepa_fecha),
            req.body.prepa_institucion.trim().toUpperCase(),
            req.body.prepa_documento,
            req.body.prepa_estatus,
            null,           // cedula
            idTrabajador
        ]);
        }

        for (let nivel of niveles) {
        // Lee cuántos registros pidió el usuario
        const cantidadRaw = req.body[`${nivel}Cantidad`];
        const cantidad    = Math.min(
            maximos[nivel],
            Math.max(0, parseInt(cantidadRaw, 10) || 0)
        );

        for (let i = 1; i <= cantidad; i++) {
            // Construye dinámicamente los nombres de campo
            const tituloField      = `${nivel}_titulo${i}`;
            const fechaField       = `${nivel}_fecha${i}`;
            const institucionField = `${nivel}_institucion${i}`;
            const documentoField   = `${nivel}_documento${i}`;
            const estatusField     = `${nivel}_estatus${i}`;
            const cedulaField      = `${nivel}_cedula${i}`;

            const titulo      = req.body[tituloField]?.trim()      || null;
            const fechaRaw    = req.body[fechaField]               || null; // yyyy-mm-dd
            const institucion = req.body[institucionField]?.trim() || null;
            const documento   = req.body[documentoField]           || null;
            const estatus     = req.body[estatusField]             || null;
            const cedula      = req.body[cedulaField]?.trim()      || null;

            // Solo inserta si al menos uno de los campos principales está presente
            if (titulo || fechaRaw || institucion) {
            // Si necesitas formatear la fecha para Excel o MySQL DATE
            const fecha = fechaRaw; // o convertirFechaTexto(fechaRaw) si lo deseas

            await db.query(insertQuery, [
                nivel.toUpperCase(),  // nivelAcademico
                titulo,
                fecha,
                institucion,
                documento,
                estatus,
                cedula,
                idTrabajador
            ]);
            }
        }
        }

        /*
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

        */
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
                
                const periodoInicio = convertirFechaTexto(rawInicio);
                const periodoFin    = rawFin
                ? convertirFechaTexto(rawFin)
                : "A LA FECHA";

               
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

                 const finOrden = rawFin
                ? fechaOrdenable(rawFin)
                : new Date(9999, 11, 31);


                experiencias.push({
                    periodoInicio,
                    periodoFin,
                    inicioOrden: fechaOrdenable(rawInicio),
                    finOrden,
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
                        exp.periodoInicio,
                        exp.periodoFin,
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
    
    const rutaPlantilla = './plantillas/curriculum.xlsx';

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
        const worksheet = workbook.worksheets[0];

        worksheet.getCell('B11').value = trabajador.primaria;

        const bachillerato = escolaridades.filter(
            exp => exp.nivelAcademico.toUpperCase() === "BACHILLERATO"
          );
        bachillerato.forEach((exp, index) => {
            const fila = 14 + index; // Empieza en la fila 14, 15, 16…
            // Usando template literals con backticks:
            worksheet.getCell(`B${fila}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${fila}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${fila}`).value = exp.institucion;
            worksheet.getCell(`E${fila}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${fila}`).value = exp.estatus;
            });

        /*worksheet.duplicateRow(29,1, true);
        worksheet.getCell("A30").value = "HOLAAA";
*/












        ///////////////////////////////////////////////////


        const UPDATE_ROW = 29;
        const updateMerges = [];
        worksheet.model.merges.forEach(range => {
        const [start, end] = range.split(':');
        const startRow = parseInt(start.match(/\d+$/)[0], 10);
        const endRow   = parseInt(end  .match(/\d+$/)[0], 10);
        if (startRow === UPDATE_ROW && endRow === UPDATE_ROW) {
            updateMerges.push(range);
        }
        });

        const totalActualizaciones = actualizaciones.length;
        if (totalActualizaciones > 1) {
        worksheet.duplicateRow(UPDATE_ROW, totalActualizaciones - 1, true);
        }

        
        updateMerges.forEach(range => {
        const [start, end] = range.split(':');
        const colStart = start.match(/^[A-Z]+/)[0];
        const colEnd   = end  .match(/^[A-Z]+/)[0];
        for (let i = 1; i < totalActualizaciones; i++) {

            worksheet.mergeCells(`${colStart}${UPDATE_ROW + i}:${colEnd}${UPDATE_ROW + i}`);
        }
        });

        actualizaciones.forEach((exp, idx) => {
        const r = UPDATE_ROW + idx;
        worksheet.getCell(`A${r}`).value = exp.tema;
        worksheet.getCell(`B${r}`).value = formatearFecha(exp.fecha);
        worksheet.getCell(`C${r}`).value = exp.institucion;
        worksheet.getCell(`E${r}`).value = exp.documento;
        });

        /////////////////////////////////
        // justo después de leer el workbook y obtener worksheet…

        const EXPERIENCE_ROW = 34;
        const expMerges = [];
        worksheet.model.merges.forEach(range => {
        const [start, end] = range.split(':');
        const startRow = +start.match(/\d+$/)[0];
        const endRow   = +end  .match(/\d+$/)[0];
        if (startRow === EXPERIENCE_ROW && endRow === EXPERIENCE_ROW) {
            expMerges.push(range);
        }
        });

        const experienciasPJ = experiencias
        const totalExp = experienciasPJ.length;
        if (totalExp > 1) {
        worksheet.duplicateRow(EXPERIENCE_ROW, totalExp - 1, true);
        }

        expMerges.forEach(range => {
        const [start, end] = range.split(':');
        const colStart = start.match(/^[A-Z]+/)[0];
        const colEnd   = end  .match(/^[A-Z]+/)[0];
        for (let i = 1; i < totalExp; i++) {
            worksheet.mergeCells(`${colStart}${EXPERIENCE_ROW + i}:${colEnd}${EXPERIENCE_ROW + i}`);
        }
        });

        experienciasPJ.forEach((exp, idx) => {
        const r = EXPERIENCE_ROW + idx;
        worksheet.getCell(`A${r}`).value = exp.periodoInicio;
        worksheet.getCell(`B${r}`).value = exp.periodoFin;
        worksheet.getCell(`C${r}`).value = exp.institucion;
        worksheet.getCell(`D${r}`).value = exp.cargo;
        worksheet.getCell(`E${r}`).value = exp.campoExperiencia;
        });






        ///////////////////////////////////////////////////
/*
        const sobrantes = LIC_PLACEHOLDER_CNT - licenciaturas.length;
        if (sobrantes > 0) {
        // Empieza a borrar justo al final de tu último dato válido
        worksheet.spliceRows(
            LIC_START_ROW + licenciaturas.length,  // índice base-1 donde arrancas a borrar
            sobrantes                               // cuántas filas borrar
        );
        }*/


        const PREPA_START_ROW = 15;
        const prepa = escolaridades.filter(e =>
            e.nivelAcademico.toUpperCase() === "BACHILLERATO"
        );
        const prepaCount = prepa.length;


        // 1) Si no hay ninguna, borramos la fila base
        if (prepaCount === 0) {
                const mergeRange = `B14:G14`;

                try {
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                }
                worksheet.mergeCells(mergeRange);
                worksheet.getCell("B14").value= "No";
                worksheet.getCell('B14').alignment = {
                horizontal: 'center'
                };

        } else {
            // 2) Si hay más de 1, duplicamos la fila base licCount-1 veces
            if (prepaCount > 1) {
                // (filaBase, númeroDeDuplicados, insert => true para desplazar filas hacia abajo)
                worksheet.duplicateRow(LIC_START_ROW, licCount - 1, true);
            }

            const start = PREPA_START_ROW;
            const end = PREPA_START_ROW + prepaCount - 1;

            // 3) Asignamos el encabezado en la primera fila
            ///worksheet.getCell(`A${start}`).value = "hola";

            /*
            worksheet.getCell(`A${start}`).alignment = {
              vertical:   "middle",
              horizontal: "center",
              wrapText:   true
            };*/

            // 4) Llenamos cada fila duplicada con los datos
            prepa.forEach((exp, i) => {
                const row = start + i;
                worksheet.getCell(`B${row}`).value = exp.nombreTitulo;
                worksheet.getCell(`C${row}`).value = exp.fechaObtencion;
                worksheet.getCell(`D${row}`).value = exp.institucion;
                worksheet.getCell(`E${row}`).value = exp.documentoAdquirido;
                worksheet.getCell(`F${row}`).value = exp.estatus;
            });

            // 5) Finalmente: si había >1, combinamos la columna A de start a end
            // 5) Finalmente: si había >1, combinamos la columna A de start a end
            if (prepaCount > 1) {
                const mergeRange = `A${start}:A${end}`;
                
                try {
                    // Intenta desfusionar (no lanza error si no existe)
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                    // Ignora el error si el merge no existe
                }
                
                // Fusiona las celdas
                worksheet.mergeCells(mergeRange);
            }
        }








        
        const LIC_START_ROW = 15;
        const licenciaturas = escolaridades.filter(e =>
            e.nivelAcademico.toUpperCase() === "LICENCIATURA"
        );
        const licCount = licenciaturas.length;

        let acarreo = licCount;

        console.log("acarreo lic: ", acarreo);
        let licDesplazar = 15 + acarreo;

        // 1) Si no hay ninguna, borramos la fila base
        if (licCount === 0) {
            const mergeRange = `B${licDesplazar}:G${licDesplazar}`;

                try {
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                }
                worksheet.mergeCells(mergeRange);

                console.log("licdesplazar: ", licDesplazar)
                worksheet.getCell(`B${licDesplazar}`).value= "No";
                worksheet.getCell(`B${licDesplazar}`).alignment = {
                horizontal: 'center'
                }
            ///worksheet.getRow(LIC_START_ROW).hidden = true;

        } else {
            // 2) Si hay más de 1, duplicamos la fila base licCount-1 veces
            if (licCount > 1) {
                acarreo = acarreo - 1;
                // (filaBase, númeroDeDuplicados, insert => true para desplazar filas hacia abajo)
                worksheet.duplicateRow(LIC_START_ROW, licCount - 1, true);
            }

            const start = LIC_START_ROW;
            const end = LIC_START_ROW + licCount - 1;

            // 3) Asignamos el encabezado en la primera fila
            ///worksheet.getCell(`A${start}`).value = "hola";

            /*
            worksheet.getCell(`A${start}`).alignment = {
              vertical:   "middle",
              horizontal: "center",
              wrapText:   true
            };*/

            // 4) Llenamos cada fila duplicada con los datos
            licenciaturas.forEach((exp, i) => {
                const row = start + i;
                worksheet.getCell(`B${row}`).value = exp.nombreTitulo;
                worksheet.getCell(`C${row}`).value = exp.fechaObtencion;
                worksheet.getCell(`D${row}`).value = exp.institucion;
                worksheet.getCell(`E${row}`).value = exp.documentoAdquirido;
                worksheet.getCell(`F${row}`).value = exp.estatus;
                worksheet.getCell(`G${row}`).value = exp.cedulaProfesional;
            });

            // 5) Finalmente: si había >1, combinamos la columna A de start a end
            // 5) Finalmente: si había >1, combinamos la columna A de start a end
            if (licCount > 1) {
                const mergeRange = `A${start}:A${end}`;
                
                try {
                    // Intenta desfusionar (no lanza error si no existe)
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                    // Ignora el error si el merge no existe
                }
                
                // Fusiona las celdas
                worksheet.mergeCells(mergeRange);
            }
        }







        ////////////////////////////////////////////////////////////////////////


        
        const MAE_START_ROW = 16 + acarreo;  // ← ajusta esta fila al inicio de tu sección "Maestría"
        const maestrias = escolaridades.filter(e =>
        e.nivelAcademico.toUpperCase() === "MAESTRIA"
        );
        const maeCount = maestrias.length;
        
        

        if (maeCount === 0) {
            console.log("MAE " , MAE_START_ROW);

            const mergeRange = `B${MAE_START_ROW}:G${MAE_START_ROW}`;

                try {
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                }
                worksheet.mergeCells(mergeRange);

                worksheet.getCell(`B${MAE_START_ROW}`).value= "Sin maestria";
                worksheet.getCell(`B${MAE_START_ROW}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

                
            ///worksheet.getRow(MAE_START_ROW+1).hidden = true;
        } else {
        if (maeCount > 1) {
            acarreo = acarreo + maeCount - 1;
            worksheet.duplicateRow(MAE_START_ROW, maeCount - 1, true);
        }

        const start = MAE_START_ROW;

        console.log ( start, " starto " , licDesplazar);
        const end   = MAE_START_ROW + maeCount - 1;

        // Encabezado en A (si lo necesitas)
        //  worksheet.getCell(`A${start}`).value = "MAESTRÍA";
        //  worksheet.getCell(`A${start}`).alignment = { vertical:"middle", horizontal:"center", wrapText:true };

        maestrias.forEach((exp, i) => {
            const row = start + i;
            worksheet.getCell(`B${row}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${row}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${row}`).value = exp.institucion;
            worksheet.getCell(`E${row}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${row}`).value = exp.estatus;
            worksheet.getCell(`G${row}`).value = exp.cedulaProfesional;
        });

        if (maeCount > 1) {
            const mergeRange = `A${start}:A${end}`;
            try { worksheet.unMergeCells(mergeRange); } catch (err) {}
            try { worksheet.mergeCells(mergeRange);   } catch (err) {
            console.warn(`No se pudo mergear ${mergeRange}:`, err);
            }
        }
        }







        ///////////////////////////////////////////////

        
        console.log("acarreo mae: ", acarreo);

        const DOC_START_ROW = 17 + acarreo;  // ← ajusta esta fila al inicio de tu sección "Maestría"
        const doctorados = escolaridades.filter(e =>
        e.nivelAcademico.toUpperCase() === "DOCTORADO"
        );
        const docCount = doctorados.length;
        
        

        if (docCount === 0) {
            console.log("DOC " , DOC_START_ROW);

            
            const mergeRange = `B${DOC_START_ROW}:G${DOC_START_ROW}`;
            console.log("mergeRange: ",mergeRange);

                try {
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                }
                worksheet.mergeCells(mergeRange);

                worksheet.getCell(`B${DOC_START_ROW}`).value= "Sin doctorado";
                worksheet.getCell(`B${DOC_START_ROW}`).alignment = {
                horizontal: 'center'
                }
            ///worksheet.getRow(MAE_START_ROW+1).hidden = true;
        } else {
        if (docCount > 1) {
            acarreo = acarreo + docCount - 1;
            worksheet.duplicateRow(DOC_START_ROW, docCount - 1, true);
        }

        const start = DOC_START_ROW;

        const end   = DOC_START_ROW + docCount - 1;

        // Encabezado en A (si lo necesitas)
        //  worksheet.getCell(`A${start}`).value = "MAESTRÍA";
        //  worksheet.getCell(`A${start}`).alignment = { vertical:"middle", horizontal:"center", wrapText:true };

        doctorados.forEach((exp, i) => {
            const row = start + i;
            worksheet.getCell(`B${row}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${row}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${row}`).value = exp.institucion;
            worksheet.getCell(`E${row}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${row}`).value = exp.estatus;
            worksheet.getCell(`G${row}`).value = exp.cedulaProfesional;
        });

        if (docCount > 1) {
            const mergeRange = `A${start}:A${end}`;
            try { worksheet.unMergeCells(mergeRange); } catch (err) {}
            try { worksheet.mergeCells(mergeRange);   } catch (err) {
            console.warn(`No se pudo mergear ${mergeRange}:`, err);
            }
        }
    }


    console.log("acarreo doc: ", acarreo);

        const ESP_START_ROW = 18 + acarreo;  // ← ajusta esta fila al inicio de tu sección "Maestría"
        const especialidades = escolaridades.filter(e =>
        e.nivelAcademico.toUpperCase() === "ESPECIALIDAD"
        );
        const espCount = especialidades.length;
        
        

        if (espCount === 0) {
            console.log("ESP " , ESP_START_ROW);

            const mergeRange = `B${ESP_START_ROW}:G${ESP_START_ROW}`;
            console.log("mergeRange: ",mergeRange);
        
                try {
                    worksheet.unMergeCells(mergeRange);
                } catch (err) {
                }
                
                try {
                    worksheet.mergeCells(mergeRange);
                } catch (err) {
                }
                

                worksheet.getCell(`B${ESP_START_ROW}`).value= "Sin especialidad";
                worksheet.getCell(`B${ESP_START_ROW}`).alignment = {
                horizontal: 'center'
                }
            ///worksheet.getRow(MAE_START_ROW+1).hidden = true;
        } else {
        if (espCount > 1) {
            acarreo = acarreo + espCount - 1;
            worksheet.duplicateRow(ESP_START_ROW, docCount - 1, true);
        }

        const start = ESP_START_ROW;

        const end   = ESP_START_ROW + docCount - 1;

        // Encabezado en A (si lo necesitas)
        //  worksheet.getCell(`A${start}`).value = "MAESTRÍA";
        //  worksheet.getCell(`A${start}`).alignment = { vertical:"middle", horizontal:"center", wrapText:true };

        especialidades.forEach((exp, i) => {
            const row = start + i;
            worksheet.getCell(`B${row}`).value = exp.nombreTitulo;
            worksheet.getCell(`C${row}`).value = exp.fechaObtencion;
            worksheet.getCell(`D${row}`).value = exp.institucion;
            worksheet.getCell(`E${row}`).value = exp.documentoAdquirido;
            worksheet.getCell(`F${row}`).value = exp.estatus;
            worksheet.getCell(`G${row}`).value = exp.cedulaProfesional;
        });

        if (espCount > 1) {
            const mergeRange = `A${start}:A${end}`;
            try { worksheet.unMergeCells(mergeRange); } catch (err) {}
            try { worksheet.mergeCells(mergeRange);   } catch (err) {
            console.warn(`No se pudo mergear ${mergeRange}:`, err);
            }
        }
    }





        


        


        
        const rutaSalida = './reportes/';
        const nombreArchivo = `cedula_${trabajador.noTrabajador}.xlsx`;
        const rutaCompleta = path.join(rutaSalida, nombreArchivo);

        await workbook.xlsx.writeFile(rutaCompleta);




const workbook25 = new ExcelJS.Workbook();
await workbook25.xlsx.readFile('./plantillas/25.xlsx');
const ws25 = workbook25.getWorksheet(1); // O ajusta si es otra hoja

// Ejemplo: Rellenar algunos campos en la plantilla 25
ws25.getCell('B5').value = trabajador.nombreTrabajador;


const licenciatura = escolaridades.find(
  exp => exp.nivelAcademico.toUpperCase() === "LICENCIATURA"
);

if (licenciatura) {
  ws25.getCell('C9').value = licenciatura.nombreTitulo;
  ws25.getCell('D9').value = licenciatura.fechaObtencion;
  ws25.getCell('E9').value = licenciatura.institucion;
}

const especialidad1 = escolaridades.find(
  exp => exp.nivelAcademico.toUpperCase() === "ESPECIALIDAD"
);

if (especialidad1) {
  ws25.getCell('C10').value = especialidad1.nombreTitulo;
  ws25.getCell('D10').value = especialidad1.fechaObtencion;
  ws25.getCell('E10').value = especialidad1.institucion;
}

actualizaciones.forEach((exp, index) => {
            const fila = 14 + index; // Ejemplo: empieza en fila 40
            ws25.getCell(`A${fila}`).value = exp.tema;
            ws25.getCell(`B${fila}`).value = formatearFecha(exp.fecha);
            ws25.getCell(`C${fila}`).value = exp.institucion;
            ws25.getCell(`E${fila}`).value = exp.documento;
        });


experiencias.slice(0, 3).forEach((exp, index) => {
    const fila = 25 + index;
    ws25.getCell(`A${fila}`).value = exp.periodoInicio;
    ws25.getCell(`B${fila}`).value = exp.periodoFin;
    ws25.getCell(`C${fila}`).value = exp.institucion;

    ws25.getCell(`D${fila}`).value = exp.cargo;
    ws25.getCell(`E${fila}`).value = exp.campoExperiencia;
});

const nombreArchivo25 = `formato25_${trabajador.noTrabajador}.xlsx`;
const rutaCompleta25 = path.join(rutaSalida, nombreArchivo25);
await workbook25.xlsx.writeFile(rutaCompleta25);
        

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
                    fs.unlinkSync(zipRuta); 
                    fs.unlinkSync(rutaCompleta); 
                    fs.unlinkSync(rutaCompleta25); 
                }
            });
        });

        archive.on('error', err => {
            throw err;
        });

        archive.pipe(output);

        // Adjunta el Excel generado
        archive.file(rutaCompleta, { name: path.basename(rutaCompleta) });
        archive.file(rutaCompleta25, { name: path.basename(rutaCompleta25) });

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






