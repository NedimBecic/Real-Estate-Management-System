function postaviCarousel(glavniElement, sviElementi, index = 0) {
  // Validate input parameters
  if (
    glavniElement == null ||
    glavniElement == undefined ||
    sviElementi.length === 0 ||
    index < 0 ||
    index >= sviElementi.length
  ) {
    return null;
  }

  const elementi = Array.from(sviElementi);

  glavniElement.innerHTML = elementi[index].outerHTML;

  return {
    fnLijevo: function () {
      index = (index - 1 + elementi.length) % elementi.length;
      glavniElement.innerHTML = elementi[index].outerHTML;
    },
    fnDesno: function () {
      index = (index + 1) % elementi.length;
      glavniElement.innerHTML = elementi[index].outerHTML;
    },
  };
}
