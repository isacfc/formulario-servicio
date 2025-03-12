document.addEventListener("DOMContentLoaded", function() {
    
    console.log("El DOM se ha cargado");
    const sexocombo = document.getElementById("sexo-opciones")


    const preguntaEmbarazo = document.getElementById("pregunta-embarazo");
  
    function actualizarPreguntaEmbarazo() {

        const sexo = sexocombo.value


        if (sexo == "sexo-femenino") {
            preguntaEmbarazo.classList.remove("hidden");
        } else {
            preguntaEmbarazo.classList.add("hidden");
        }
    }
  
    sexocombo.addEventListener("change", actualizarPreguntaEmbarazo);
  });
  