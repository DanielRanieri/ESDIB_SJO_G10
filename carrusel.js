document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.carrusel-track');
    const slides = Array.from(track.children);
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');

    let index = 0; 
    const visible = 3; 

    function actualizarCarrusel() {
        const slideWidth = slides[0].getBoundingClientRect().width + 20; // ancho + gap
        track.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    btnNext.addEventListener('click', () => {
        if (index < slides.length - visible) {
            index++;
            actualizarCarrusel();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (index > 0) {
            index--;
            actualizarCarrusel();
        }
    });

    window.addEventListener('resize', actualizarCarrusel);

    actualizarCarrusel();
});

