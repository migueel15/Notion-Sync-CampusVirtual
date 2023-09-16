const asignaturas = {
  FunEle: "Electronica",
  CalparCom: "Calculo",
  EstDat: "ED",
  EstCom: "EC",
  AnaDis: "ADA",
  TeoAut: "TALF",
  BasDat: "BD",
}

function getAsignatura(string) {
  let clave = ""
  const claves = Object.keys(asignaturas)
  for (let i = 0; i < claves.length; i++) {
    if (string.includes(claves[i])) {
      clave = claves[i]
      return asignaturas[clave]
    }
  }
  if (clave === "") return string
}

module.exports = { getAsignatura }
