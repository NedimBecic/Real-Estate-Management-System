function setDisplay(glavniElement, elementi, index = 0) {
  if (!elementi || elementi.length === 0) return;
  glavniElement.innerHTML = elementi[index].outerHTML;
}

function postaviCarousel(glavniElement, sviElementi, index = 0) {
  if (!glavniElement || !sviElementi || sviElementi.length === 0) {
    return null;
  }

  const elementi = Array.from(sviElementi);
  let currentIndex = index;

  setDisplay(glavniElement, elementi, currentIndex);

  return {
    fnLijevo: function () {
      currentIndex = (currentIndex - 1 + elementi.length) % elementi.length;
      setDisplay(glavniElement, elementi, currentIndex);
    },
    fnDesno: function () {
      currentIndex = (currentIndex + 1) % elementi.length;
      setDisplay(glavniElement, elementi, currentIndex);
    },
    getCurrentIndex: function () {
      return currentIndex;
    },
    updateElements: function (newElements) {
      elementi.push(...newElements);
    },
  };
}
