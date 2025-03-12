document.addEventListener("DOMContentLoaded", function() {
    
    console.log("El DOM se ha cargado");
    const sexocombo = document.getElementById("sexo-opciones")
    



    const radioembarazo = document.getElementById("radio-embarazo")
    const hijoscontador = document.getElementById("hijoscontador")


    const preguntaEmbarazo = document.getElementById("pregunta-embarazo");
    const preguntaHijos = document.getElementById("preguntahijos");

    var radiospapa = document.getElementsByName("papa");
    const espacioHijos = document.getElementById("espacioHijos");
  
    function actualizarPreguntaEmbarazo() {

        const sexo = sexocombo.value


        if (sexo == "sexo-femenino") {
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
            preguntaHijos.classList.add("hidden");
            hijoscontador.removeAttribute("required");
            
        }
    }

   

    

    




    sexocombo.addEventListener("change", actualizarPreguntaEmbarazo);

    radiospapa.forEach(radio => {
        radio.addEventListener("change", actualizarPreguntaHijos);
    });


});