let carousel;

window.onload = function() {
    var glavniElement = document.getElementById("upiti");
    var sviElementi = glavniElement.getElementsByClassName("upit");
    carousel = postaviCarousel(glavniElement, sviElementi, 0);
}

function carouselPrev() {
  if (carousel) {
    carousel.fnLijevo();
  }
}

function carouselNext() {
  if (carousel) {
    carousel.fnDesno();
  }
}

