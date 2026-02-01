// Espera a que todo el DOM esté cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    
    // Selecciona el contenedor principal que contiene todas las diapositivas
    const track = document.querySelector('.carrusel-track');

    // Crea un array con todas las diapositivas (hijos del track)
    const slides = Array.from(track.children);

    // Botón para mover el carrusel hacia atrás
    const btnPrev = document.querySelector('.prev');

    // Botón para mover el carrusel hacia adelante
    const btnNext = document.querySelector('.next');

    let index = 0; // Índice de la primera diapositiva visible

    const visible = 3; // Número de slides visibles a la vez

    // Función que actualiza la posición del carrusel
    function actualizarCarrusel() {
        // Calcula el ancho de una diapositiva + espacio (gap) entre slides
        const slideWidth = slides[0].getBoundingClientRect().width + 20;

        // Mueve el track usando translateX según el índice actual
        track.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    // Evento para el botón "Siguiente"
    btnNext.addEventListener('click', () => {
        // Solo avanza si no se excede del total de slides menos las visibles
        if (index < slides.length - visible) {
            index++; // Incrementa el índice
            actualizarCarrusel(); // Actualiza la posición del carrusel
        }
    });

    // Evento para el botón "Anterior"
    btnPrev.addEventListener('click', () => {
        // Solo retrocede si el índice es mayor a 0
        if (index > 0) {
            index--; // Decrementa el índice
            actualizarCarrusel(); // Actualiza la posición del carrusel
        }
    });

    // Recalcula la posición si se cambia el tamaño de la ventana
    window.addEventListener('resize', actualizarCarrusel);

    // Inicializa la posición del carrusel al cargar la página
    actualizarCarrusel();
});
