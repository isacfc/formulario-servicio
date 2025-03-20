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

    
    function agregarCamposHijos(){
        noHijos = hijoscontador.value;
        const espacioHijos = document.getElementById("espacioHijos");

        while (espacioHijos.hasChildNodes()) {
            espacioHijos.removeChild(espacioHijos.lastChild);
        }

        for (let i=0;i<noHijos;i++){
            const divHijo = document.createElement("div");
            divHijo.classList.add("mb-6", "p-4", "rounded");
            // Create an <input> element, set its type and name attributes
            var label = document.createElement("label");

            label.textContent= "Hijo " + (i+1);

            label.classList.add("mt-4");
            


            var input = document.createElement("input");
            input.type = "text";
            input.name = "inicialesHijo" + i;
            input.placeholder = "Iniciales";
            input.classList.add("border", "rounded-full", "bg-gray-50", "m-2","p-3");
            input.setAttribute("required", "true");

            var select = document.createElement("select");
            select.name = "selectHijo" + i;
            select.classList.add("border", "rounded-full", "bg-gray-50", "m-2", "p-3");
            select.setAttribute("required", "true");

            // Opciones
            var opcion1 = document.createElement("option");
            opcion1.value = "Seleccione";
            opcion1.textContent = "Seleccione el sexo";
            select.appendChild(opcion1);

            var opcion2 = document.createElement("option");
            opcion2.value = "Masculino";
            opcion2.textContent = "Masculino";
            select.appendChild(opcion2);

            var opcion3 = document.createElement("option");
            opcion3.value = "Femenino";
            opcion3.textContent = "Femenino";
            select.appendChild(opcion3);

            // ⏺️ Validación inicial (por defecto inválido)
            select.setCustomValidity("Seleccione una opción");

            // ⏺️ Listener en cada select dinámico
            select.addEventListener("change", function() {
                if (select.value !== "Seleccione") {
                    select.setCustomValidity("");
                } else {
                    select.setCustomValidity("Seleccione una opción");
                }
                select.reportValidity();
            });
            // Finalmente, agregar  
            


            var input2 = document.createElement("input");
            input2.type = "text";
            input2.name = "fechaNacimientoHijo" + i;
            input2.placeholder = "Fecha de nacimiento";
            input2.classList.add("border", "rounded-full", "bg-gray-50", "m-2","p-3","datepicker");
            input2.setAttribute("required", "true");
            Inputmask("99-99-9999", { placeholder: "dd-mm-yyyy" }).mask(input2);

            var input3 = document.createElement("input");
            input3.type = "number";
            input3.name = "edadHijo" + i;
            input3.placeholder = "Edad (años) a la fecha";
            input3.classList.add("border", "rounded-full", "bg-gray-50", "m-2","p-3");
            input3.setAttribute("required", "true");

            
            espacioHijos.appendChild(label);
            divHijo.appendChild(input);
            divHijo.appendChild(select);

            selectEventListener();

            divHijo.appendChild(input2);
            divHijo.appendChild(input3);
            espacioHijos.appendChild(document.createElement("br"));
            espacioHijos.appendChild(divHijo);
            // Append a line break
            espacioHijos.appendChild(document.createElement("br"));

            var dateInputs = document.querySelectorAll('.datepicker');
            for (let j = 0; j < dateInputs.length; j++) {
            var input = dateInputs[j];
            // Verifica si ya se ha inicializado Flatpickr en este input
            if (!input._flatpickr) {
                flatpickr(input, {
                dateFormat: "d-m-Y",
                allowInput: true
                });
            }
            }


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

        // VALIDACIÓN PARA SELECTS DINÁMICOS
        
      });

    
   

    

    

    sexocombo.addEventListener("change", actualizarPreguntaEmbarazo);

    radiospapa.forEach(radio => {
        radio.addEventListener("change", actualizarPreguntaHijos);
    });

    hijoscontador.addEventListener("input", agregarCamposHijos);


});