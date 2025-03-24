document.addEventListener("DOMContentLoaded", function() {
    
    console.log("El DOM se ha cargado");
    const sexocombo = document.getElementById("sexo-opciones")
    const botonFormulario = document.getElementById("botonFormulario");
    



    const radioembarazo = document.getElementById("radio-embarazo")
    const hijoscontador = document.getElementById("hijoscontador")


    const preguntaEmbarazo = document.getElementById("pregunta-embarazo");
    const preguntaHijos = document.getElementById("preguntahijos");

    var radiospapa = document.getElementsByName("papa");
    var form = document.querySelector("form");

  
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
            labelIniciales.textContent = "Iniciales del Hijo (Sin puntos ni guiones. Ejemplo: JIFC):";
            labelIniciales.classList.add("block", "font-medium", "mb-1", "text-gray-700");
            divHijo.appendChild(labelIniciales);

            
    
            // Iniciales input
            const input = document.createElement("input");
            input.type = "text";
            input.name = "inicialesHijo" + i;
            input.placeholder = "Ejemplo: J.P.G.";
            input.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3", "uppercase");
            input.setAttribute("required", "true");
            divHijo.appendChild(input);
    
            // Sexo label
            const labelSexo = document.createElement("label");
            labelSexo.textContent = "Sexo del Hijo:";
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
    
            select.setCustomValidity("Seleccione una opción");
    
            select.addEventListener("change", function() {
                if (select.value !== "Seleccione") {
                    select.setCustomValidity("");
                } else {
                    select.setCustomValidity("Seleccione una opción");
                }
                select.reportValidity();
            });
            divHijo.appendChild(select);
    
            // Fecha nacimiento label
            const labelFecha = document.createElement("label");
            labelFecha.textContent = "Fecha de nacimiento del hijo:";
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
            labelEdad.textContent = "Edad actual del hijo en años (Ejemplo: 5):";
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

   
    

    form.addEventListener("submit", function(event) {
        let valido = true; // Para verificar si todos los selects son válidos
    
        // Validamos el sexo como ya lo tenías
        if (sexocombo.value === "Seleccione") {
            sexocombo.setCustomValidity("Rellene correctamente: seleccione una opción");
            sexocombo.reportValidity();
            valido = false;
        } else {
            sexocombo.setCustomValidity("");
        }


        if (!valido) {
            event.preventDefault(); // Prevenimos el envío del formulario si la validación falla
        }

        // VALIDACIÓN PARA SELECTS DINÁMICOS
        
      });

    
   

    

    

    sexocombo.addEventListener("change", actualizarPreguntaEmbarazo);

    radiospapa.forEach(radio => {
        radio.addEventListener("change", actualizarPreguntaHijos);
    });

    hijoscontador.addEventListener("input", agregarCamposHijos);


});