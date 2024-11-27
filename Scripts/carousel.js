function setDisplay(glavniElement, elementi, screenWidth, index = 0) {
  if (screenWidth < 600) {
    glavniElement.innerHTML = elementi[index].outerHTML;
  } else {
    glavniElement.innerHTML = elementi.map((el) => el.outerHTML).join("");
  }
}

function postaviCarousel(glavniElement, sviElementi, index = 0) {
  if (
    !glavniElement ||
    !sviElementi ||
    sviElementi.length === 0 ||
    index < 0 ||
    index >= sviElementi.length
  ) {
    return null;
  }

  const elementi = Array.from(sviElementi);

  const updateLayout = () => {
    const screenWidth = window.innerWidth;
    setDisplay(glavniElement, elementi, screenWidth, index);
  };

  updateLayout();

  window.addEventListener("resize", updateLayout);

  return {
    fnLijevo: function () {
      index = (index - 1 + elementi.length) % elementi.length;
      if (window.innerWidth < 600) {
        glavniElement.innerHTML = elementi[index].outerHTML;
      }
    },
    fnDesno: function () {
      index = (index + 1) % elementi.length;
      if (window.innerWidth < 600) {
        glavniElement.innerHTML = elementi[index].outerHTML;
      }
    },
  };
}
