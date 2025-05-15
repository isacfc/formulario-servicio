document.addEventListener("DOMContentLoaded", function() {
    
    console.log("El DOM se ha cargado");
    const sexocombo = document.getElementById("sexo-opciones");
    const sexoconyugecombo = document.getElementById("sexoConyuge-opciones");
    const civilcombo = document.getElementById("civil-opciones");
    const sangrecombo = document.getElementById("sangre-opciones");
    const botonFormulario = document.getElementById("botonFormulario");

    const camposAcentos = document.querySelectorAll(".acentos");
    const inputsFecha = document.querySelectorAll("input[data-format='dd-mm-yyyy']");


    const radioscronica = document.getElementsByName("cronica");
    const hijoscontador = document.getElementById("hijoscontador");


    const preguntaEmbarazo = document.getElementById("pregunta-embarazo");
    const preguntaHijos = document.getElementById("preguntahijos");
    

    var radiospapa = document.getElementsByName("papa");
    var form = document.querySelector("form");

    const fechaConyuge = document.getElementById("fechaConyuge");

    
    function actualizarPreguntaEmbarazo() {

        const sexo = sexocombo.value


        if (sexo == "Femenino") {
            preguntaEmbarazo.classList.remove("hidden");
            radioembarazo.setAttribute("required","true");
            console.log("se ha agregado el required");
            
        } else {
            preguntaEmbarazo.classList.add("hidden");
            radioembarazo.removeAttribute("required");
            
            console.log("se ha quitado el required")
        }
    }


    function actualizarPreguntaConyuge() {
        const estadoCivil = document.getElementById("civil-opciones").value;
        const datosConyuge = document.getElementById("datosConyuge");
        const camposConyuge = document.getElementsByClassName("conyuge");

        console.log(estadoCivil);

        if (estadoCivil === "Casado/a"){
            datosConyuge.classList.remove("hidden");
            for (let i = 0; i < camposConyuge.length; i++) {
                camposConyuge[i].required = true;
              }
        }
        else{
            datosConyuge.classList.add("hidden");
            for (let i = 0; i < camposConyuge.length; i++) {
                camposConyuge[i].required = false;
              }

        }
        
        
    }

    function actualizarPreguntaCronica() {
        const preguntaCronica = document.getElementById("preguntaCronica");
        const textoCronica = document.getElementById("cronica-texto");
        if (radioscronica[0].checked) {
            preguntaCronica.classList.remove("hidden");
            textoCronica.setAttribute("required","true");
            
        } else {
            preguntaCronica.classList.add("hidden");
            textoCronica.removeAttribute("required");
            
                
            
        }

    }


    function actualizarPreguntaHijos() {

        
    
    
        if (radiospapa[0].checked) {
            preguntaHijos.classList.remove("hidden");
            hijoscontador.setAttribute("required","true");
            
        } else {
            const espacioHijos = document.getElementById("espacioHijos");
            preguntaHijos.classList.add("hidden");
            hijoscontador.removeAttribute("required");
            

                while (espacioHijos.hasChildNodes()) {
                    espacioHijos.removeChild(espacioHijos.lastChild);
                }
                hijoscontador.value=null;
                
            
        }
    }
    function selectEventListener(){
        const selectsDinamicos = document.querySelectorAll('select[name^="selectHijo"]');
        for (let o=0; o<selectsDinamicos.length; o++){
            selectsDinamicos[o].addEventListener("change",function() {
            if (selectsDinamicos[o].value !== "Seleccione"){
                selectsDinamicos[o].setCustomValidity("");
            }else {
                selectsDinamicos[o].setCustomValidity("Seleccione una opción");
                }    
            selectsDinamicos[o].reportValidity();
            });
            
        }
    }

    
    function agregarCamposHijos() {
        noHijos = hijoscontador.value;
        const espacioHijos = document.getElementById("espacioHijos");
    
        while (espacioHijos.hasChildNodes()) {
            espacioHijos.removeChild(espacioHijos.lastChild);
        }
    
        for (let i = 0; i < noHijos; i++) {
            const divHijo = document.createElement("div");
            divHijo.classList.add("mb-3", "p-4", "rounded", "border", "border-gray-300");
    
            // Título del hijo
            const titulo = document.createElement("h3");
            titulo.textContent = `Datos del Hijo ${i + 1}`;
            titulo.classList.add("font-bold", "text-lg", "mb-4", "text-gray-800");
            divHijo.appendChild(titulo);
    
            // Iniciales label
            const labelIniciales = document.createElement("label");
            labelIniciales.textContent = "Iniciales de la hija o hijo (Ejemplo: JIFC):";
            labelIniciales.classList.add("block", "font-medium", "mb-1", "text-gray-700");
            divHijo.appendChild(labelIniciales);
    
            // Iniciales input
            const input = document.createElement("input");
            input.type = "text";
            input.name = "inicialesHijo" + i;
            input.placeholder = "Ejemplo: JPG";
            input.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3", "uppercase");
            input.setAttribute("required", "true");
            divHijo.appendChild(input);
    
            // Sexo label
            const labelSexo = document.createElement("label");
            labelSexo.textContent = "Sexo de la hija o hijo:";
            labelSexo.classList.add("block", "font-medium", "mb-1", "text-gray-700", "mt-4");
            divHijo.appendChild(labelSexo);
    
            // Sexo select
            const select = document.createElement("select");
            select.name = "selectHijo" + i;
            select.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3");
            select.setAttribute("required", "true");
    
            const opcion1 = document.createElement("option");
            opcion1.value = "Seleccione";
            opcion1.textContent = "Seleccione el sexo";
            select.appendChild(opcion1);
    
            const opcion2 = document.createElement("option");
            opcion2.value = "Masculino";
            opcion2.textContent = "Masculino";
            select.appendChild(opcion2);
    
            const opcion3 = document.createElement("option");
            opcion3.value = "Femenino";
            opcion3.textContent = "Femenino";
            select.appendChild(opcion3);
    
            select.setCustomValidity("Seleccione el sexo del hijo");
    
            select.addEventListener("change", function() {
                if (select.value !== "Seleccione") {
                    select.setCustomValidity("");
                } else {
                    select.setCustomValidity("Seleccione el sexo del hijo");
                }
                select.reportValidity();
            });
            divHijo.appendChild(select);
    
            // Fecha nacimiento label
            const labelFecha = document.createElement("label");
            labelFecha.textContent = "Fecha de nacimiento de la hija o hijo:";
            labelFecha.classList.add("block", "font-medium", "mb-1", "text-gray-700", "mt-4");
            divHijo.appendChild(labelFecha);
    
            // Fecha nacimiento input
            const input2 = document.createElement("input");
            input2.type = "text";
            input2.name = "fechaNacimientoHijo" + i;
            input2.placeholder = "dd-mm-yyyy";
            input2.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3", "datepicker");
            input2.setAttribute("required", "true");
            Inputmask("99-99-9999", { placeholder: "dd-mm-yyyy" }).mask(input2);
            divHijo.appendChild(input2);
    
            // Edad label
            const labelEdad = document.createElement("label");
            labelEdad.textContent = "Edad actual de la hija o hijo en años (Ejemplo: 5):";
            labelEdad.classList.add("block", "font-medium", "mb-1", "text-gray-700", "mt-4");
            divHijo.appendChild(labelEdad);
    
            // Edad input
            const input3 = document.createElement("input");
            input3.type = "number";
            input3.name = "edadHijo" + i;
            input3.placeholder = "Ejemplo: 5";
            input3.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3");
            input3.setAttribute("required", "true");
            divHijo.appendChild(input3);
    
            espacioHijos.appendChild(divHijo);
    
            // Flatpickr para fechas
            flatpickr(input2, {
                dateFormat: "d-m-Y",
                allowInput: true
            });
    
            // Listener select
            selectEventListener();
        }
    }

    sexocombo.addEventListener("change", function() {
        if (sexocombo.value !== "Seleccione") {
          sexocombo.setCustomValidity("");
        } else {
          sexocombo.setCustomValidity("Rellene correctamente: seleccione una opción");
        }
      });

    civilcombo.addEventListener("change", function() {
        if (civilcombo.value !== "Seleccione") {
            civilcombo.setCustomValidity("");

        
        } else {
            civilcombo.setCustomValidity("Rellene correctamente: seleccione un estado civil");
        }

        if (civilcombo.value === "Casado/a"){
            sexoconyugecombo.addEventListener("change", function() {
                if (sexoconyugecombo.value !== "Seleccione") {
                  sexoconyugecombo.setCustomValidity("");
                } else {
                  sexoconyugecombo.setCustomValidity("Rellene correctamente: seleccione una opción");
                }
              });
        }
    });

    sangrecombo.addEventListener("change", function() {
        if (sangrecombo.value !== "Seleccione") {
            sangrecombo.setCustomValidity("");
        } else {
            sangrecombo.setCustomValidity("Rellene correctamente: seleccione una opción");
        }
    });





   
    

      form.addEventListener("submit", function(event) {
        let valido = true;
        const telefonoInput = document.getElementById('noTelefono');
        const postalInput = document.getElementById('postal');
        const errorMessage = document.getElementById('error-message');
        const errorMessage2 = document.getElementById('error-message2');
    
        // Resetear mensajes de error
        errorMessage.style.display = 'none';
        errorMessage2.style.display = 'none';
        

        for (let i = 1; i <= 3; i++) {
            const titulo = document.querySelector(`[name="licenciatura_titulo${i}"]`);
            const fecha = document.querySelector(`[name="licenciatura_fecha${i}"]`);
            const inst = document.querySelector(`[name="licenciatura_institucion${i}"]`);

            if (!titulo || !fecha || !inst) continue;

            const hayAlgunDato = titulo.value.trim() || fecha.value.trim() || inst.value.trim();

            if (hayAlgunDato && (!titulo.value.trim() || !fecha.value.trim() || !inst.value.trim())) {
            alert(`⚠️ Completa todos los campos de la Licenciatura ${i} o deja todos vacíos.`);
            if (!titulo.value.trim()) titulo.focus();
            else if (!fecha.value.trim()) fecha.focus();
            else inst.focus();
            e.preventDefault();
            valido = false;
            break;
            }
        }
        // Validación de sexo
        if (sexocombo.value === "Seleccione") {
            sexocombo.setCustomValidity("Rellene correctamente: seleccione una opción");
            sexocombo.reportValidity();
            valido = false;
        } else {
            sexocombo.setCustomValidity("");
        }

        if (civilcombo.value === "Seleccione") {
            civilcombo.setCustomValidity("Rellene correctamente: seleccione una opción");
            civilcombo.reportValidity();
            valido = false;
        }else if (civilcombo.value === "Casado/a") {
            civilcombo.setCustomValidity("");
        
            if (sexoconyugecombo.value === "Seleccione") {
                sexoconyugecombo.setCustomValidity("Rellene correctamente: seleccione una opción");
                sexoconyugecombo.reportValidity();
                valido = false;
            } else {
                sexoconyugecombo.setCustomValidity("");
            }
        

        
        } else {
            civilcombo.setCustomValidity("");
            sexoconyugecombo.setCustomValidity("");
        }

        if (sangrecombo.value === "Seleccione") {
            sangrecombo.setCustomValidity("Rellene correctamente: seleccione una opción");
            sangrecombo.reportValidity();
            valido = false;
        } else {
            sangrecombo.setCustomValidity("");
        }

       
    
        // Validación de teléfono (corregido isNaN)
        const telefono = telefonoInput.value;
        if (telefono.length !== 10 || isNaN(telefono)) {
            errorMessage.style.display = 'inline';
            valido = false;
        }
    
        // Validación de código postal (mejor usar input text)
        const codigoPostal = postalInput.value;
        if (codigoPostal.length !== 5 || isNaN(codigoPostal)) {
            errorMessage2.style.display = 'inline';
            valido = false;
        }

        if (!validarEscolaridad("licenciatura", 3, "Licenciatura")) valido = false;
        if (!validarEscolaridad("maestria", 3, "Maestría")) valido = false;
        if (!validarEscolaridad("especialidad", 3, "Especialidad")) valido = false;
        if (!validarEscolaridad("doctorado", 2, "Doctorado")) valido = false;

    
        // Si alguna validación falla, prevenir envío
        if (!valido) {
            event.preventDefault();
            // Opcional: enfocar primer campo con error
            if (sexocombo.value === "Seleccione") sexocombo.focus();
            else if (civilcombo.value === "Seleccione") civilcombo.focus();
            else if (civilcombo.value=== "Casado/a" && sexoconyugecombo.value === "Seleccione") sexoconyugecombo.focus();
            else if (sangrecombo.value === "Seleccione") civilcombo.focus();
            else if (errorMessage.style.display === 'inline') telefonoInput.focus();
            else postalInput.focus();
        }
    });

    
   

    

    

    sexocombo.addEventListener("change", actualizarPreguntaEmbarazo);
    civilcombo.addEventListener("change", actualizarPreguntaConyuge);
    radiospapa.forEach(radio => {
        radio.addEventListener("change", actualizarPreguntaHijos);
    });

    radioscronica.forEach(radio => {
        radio.addEventListener("change", actualizarPreguntaCronica);
    });

    hijoscontador.addEventListener("input", agregarCamposHijos);
    Inputmask("99-99-9999", { placeholder: "dd-mm-yyyy" }).mask(fechaConyuge);
    flatpickr(fechaConyuge, {
        dateFormat: "d-m-Y",
        allowInput: true
    });

    inputsFecha.forEach(function(input) {
        // Flatpickr
        flatpickr(input, {
            dateFormat: "d-m-Y",
            allowInput: true
        });
    
        // Inputmask
        Inputmask("99-99-9999", { placeholder: "dd-mm-yyyy" }).mask(input);
    });

    document.querySelectorAll("input[data-format='mm-yyyy']").forEach(function(input) {
        flatpickr(input, {
          plugins: [
            new monthSelectPlugin({
              shorthand: false,
              dateFormat: "m-Y",   // <-- Cómo se guarda
              altFormat: "F Y",    // <-- Cómo se muestra (opcional)
              theme: "light",
              allowInput: true
            })
          ],
          allowInput: true
        });
      
        // Inputmask para mm-yyyy
        Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(input);
      });
      

    camposAcentos.forEach(reemplazarAcentos);


});


function reemplazarAcentos(campo){
        
    campo.addEventListener('input', function () {
        //eliminar  losacentos
        //.value = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let valor = campo.value
        .replace(/ñ/gi, 'ñ') // Mantener ñ existentes
        .normalize("NFD")
        // Convertir n + tilde a ñ (después de normalizar)
        .replace(/\u006E\u0303/gi, 'ñ')
        // Eliminar otros diacríticos
        .replace(/[\u0300-\u036f]/g, "")
        // Permitir ñ/Ñ en el filtro
        .replace(/[^a-zA-Z0-9ñÑ\s\.]/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
        
        campo.value = valor.toUpperCase();
      });
}



let experienciaIndex = 0;

function agregarExperiencia() {
    
const container = document.getElementById("espacioExperiencia");

const div = document.createElement("div");
div.classList.add("mb-3", "p-4", "rounded", "border", "border-gray-300");

div.innerHTML = `
<label class="block text-gray-700 font-semibold">Periodo: Mes/Año de inicio</label>
<input type="text" name="experiencia_inicio${experienciaIndex}" data-format="mm-yyyy" required class="border w-full p-2 rounded-md bg-gray-50 mb-2" placeholder="MM-AAAA">

<label class="block text-gray-700 font-semibold"> Periodo: Mes/Año de fin</label>
<input type="month" name="experiencia_fin${experienciaIndex}" data-format="mm-yyyy" required class="border w-full p-2 rounded-md bg-gray-50"  placeholder="MM-AAAA">

<label class="block text-gray-700 font-semibold">Institución</label>
  <select name="experiencia_institucion${experienciaIndex}"
          class="border w-full p-2 rounded-md bg-gray-50 mb-2">
    <option value="PJ">Poder Judicial del Estado de Hidalgo</option>
    <option value="OTRA">Otra</option>
  </select>

  <div id="adscripcion-container-${experienciaIndex}" class="mb-2">
    <label class="block text-gray-700 font-semibold">Adscripción</label>
    <input type="text" name="experiencia_adscripcion${experienciaIndex}"
           placeholder="EJ. PRIMERA SALA CIVIL Y FAMILIAR"
           class="acentos border w-full p-2 rounded-md bg-gray-50">
  </div>

  <div id="otra-inst-container-${experienciaIndex}" class="hidden mb-2">
    <label class="block text-gray-700 font-semibold">Nombre de la institución</label>
    <input type="text" name="experiencia_otrainst${experienciaIndex}"
           placeholder="EJ. BANCO AZTECA, S.A."
           class="acentos border w-full p-2 rounded-md bg-gray-50">
  </div>

<label class="block text-gray-700 font-semibold">Cargo ó Puesto desempeñado</label>
<input type="text" name="experiencia_puesto${experienciaIndex}" placeholder="Ej. SECRETARIA DE ESTUDIO Y CUENTA" required class="acentos border w-full p-2 rounded-md bg-gray-50 mb-2">

<label class="block text-gray-700 font-semibold">Campo de experiencia</label>
<input type="text" name="experiencia_campo${experienciaIndex}" placeholder="Ej. ELABORACION DE PROYECTOS DE SENTENCIA DE SEGUNDA INSTANCIA" required class="acentos border w-full p-2 rounded-md bg-gray-50 mb-2">


`;
if(experienciaIndex < 10){

    container.appendChild(div);


    
   

    // dentro de agregarExperiencia(), justo tras appendChild(div):
    const selectInst = div.querySelector(
        `select[name="experiencia_institucion${experienciaIndex}"]`
    );
    const adscripContainer = div.querySelector(
        `#adscripcion-container-${experienciaIndex}`
    );
    const otraContainer = div.querySelector(
        `#otra-inst-container-${experienciaIndex}`
    );
    function toggleCampos(e) {
        if (e.target.value === 'PJ') {
          adscripContainer.classList.remove('hidden');
          otraContainer.classList.add('hidden');
        } else {
          adscripContainer.classList.add('hidden');
          otraContainer.classList.remove('hidden');
        }
      }
      
      // Inicializa según el valor por defecto
      toggleCampos({ target: selectInst });
      
      // Escucha cambios
      selectInst.addEventListener('change', toggleCampos);
      

      experienciaIndex++;
      document.getElementById('experienciaTotal').value = experienciaIndex;
}



    document.querySelectorAll("input[data-format='mm-yyyy']").forEach(function(input) {
        flatpickr(input, {
        plugins: [
            new monthSelectPlugin({
            shorthand: false,
            dateFormat: "m-Y",   // <-- Cómo se guarda
            altFormat: "F Y",    // <-- Cómo se muestra (opcional)
            theme: "light",
            allowInput: true
            })
        ],
        allowInput: true
        });
    
        // Inputmask para mm-yyyy
        Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(input);
    });

    const camposAcentos = document.querySelectorAll(".acentos");
    camposAcentos.forEach(reemplazarAcentos);


}


function quitarExperiencia() {
    const container = document.getElementById("espacioExperiencia");
    container.removeChild(container.lastChild);
    experienciaIndex = Math.max(0, experienciaIndex - 1);
    document.getElementById('experienciaTotal').value = experienciaIndex;



}


let licVisible = 1;

document.getElementById("mostrarMasLicenciaturas").addEventListener("click", () => {
  licVisible++;
  if (licVisible <= 3) {
    document.getElementById(`lic${licVisible}`).classList.remove("hidden");

    // aplicar flatpickr + inputmask
    flatpickr(
      document.querySelector(`[name="licenciatura_fecha${licVisible}"]`), {
        plugins: [new monthSelectPlugin({ dateFormat: "m-Y", altFormat: "F Y" })],
        allowInput: true
      }
    );

    Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(
      document.querySelector(`[name="licenciatura_fecha${licVisible}"]`)
    );
  }

  if (licVisible === 3) {
    document.getElementById("mostrarMasLicenciaturas").disabled = true;
    document.getElementById("mostrarMasLicenciaturas").textContent = "Límite de licenciatura alcanzado";
  }
});

let maeVisible = 1;
document.getElementById("mostrarMasMaestrias").addEventListener("click", () => {
  maeVisible++;
  if (maeVisible <= 3) {
    document.getElementById(`mae${maeVisible}`).classList.remove("hidden");

    // aplicar flatpickr + inputmask
    flatpickr(
      document.querySelector(`[name="maestria_fecha${maeVisible}"]`), {
        plugins: [new monthSelectPlugin({ dateFormat: "m-Y", altFormat: "F Y" })],
        allowInput: true
      }
    );

    Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(
      document.querySelector(`[name="maestria_fecha${maeVisible}"]`)
    );
  }
  

  if (maeVisible === 3) {
    document.getElementById("mostrarMasMaestrias").disabled = true;
    document.getElementById("mostrarMasMaestrias").textContent = "Límite de maestrias alcanzado";
  }
});


let espVisible = 1;
document.getElementById("mostrarMasEspecialidades").addEventListener("click", () => {
  espVisible++;
  if (espVisible <= 3) {
    document.getElementById(`esp${espVisible}`).classList.remove("hidden");

    // aplicar flatpickr + inputmask
    flatpickr(
      document.querySelector(`[name="especialidad_fecha${espVisible}"]`), {
        plugins: [new monthSelectPlugin({ dateFormat: "m-Y", altFormat: "F Y" })],
        allowInput: true
      }
    );

    Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(
      document.querySelector(`[name="especialidad_fecha${espVisible}"]`)
    );
  }
  

  if (espVisible === 3) {
    document.getElementById("mostrarMasEspecialidades").disabled = true;
    document.getElementById("mostrarMasEspecialidades").textContent = "Límite de especialidades alcanzado";
  }
});




let docVisible = 1;
document.getElementById("mostrarMasDoctorados").addEventListener("click", () => {
  docVisible++;
  if (docVisible <= 2) {
    document.getElementById(`doc${docVisible}`).classList.remove("hidden");

    // aplicar flatpickr + inputmask
    flatpickr(
      document.querySelector(`[name="doctorado_fecha${docVisible}"]`), {
        plugins: [new monthSelectPlugin({ dateFormat: "m-Y", altFormat: "F Y" })],
        allowInput: true
      }
    );

    Inputmask("99-9999", { placeholder: "mm-yyyy" }).mask(
      document.querySelector(`[name="doctorado_fecha${docVisible}"]`)
    );
  }
  

  if (docVisible === 2) {
    document.getElementById("mostrarMasDoctorados").disabled = true;
    document.getElementById("mostrarMasDoctorados").textContent = "Límite de doctorados alcanzado";
  }
});




function validarEscolaridad(prefix, cantidadMaxima, nombreVisible) {
  for (let i = 1; i <= cantidadMaxima; i++) {
    const titulo = document.querySelector(`[name="${prefix}_titulo${i}"]`);
    const fecha = document.querySelector(`[name="${prefix}_fecha${i}"]`);
    const inst = document.querySelector(`[name="${prefix}_institucion${i}"]`);

    if (!titulo || !fecha || !inst) continue;

    const hayAlgo = titulo.value.trim() || fecha.value.trim() || inst.value.trim();
    const incompleto = !titulo.value.trim() || !fecha.value.trim() || !inst.value.trim();

    if (hayAlgo && incompleto) {
      alert(`⚠️ Completa todos los campos de ${nombreVisible} ${i} o deja todos vacíos.`);
      if (!titulo.value.trim()) titulo.focus();
      else if (!fecha.value.trim()) fecha.focus();
      else inst.focus();
      return false;
    }
  }
  return true;
}



