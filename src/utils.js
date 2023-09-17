const { asignaturas, dateRange } = require("./config")

function mapAsignatura(string) {
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

function getDateRange() {
  const today = new Date()
  const minDate = new Date()
  const maxDate = new Date()
  minDate.setDate(today.getDate() - dateRange.startDate)
  minDate.setHours(2, 0, 0, 0)
  maxDate.setDate(today.getDate() + dateRange.endDate - 1)
  maxDate.setHours(2, 0, 0, 0)

  return {
    minDate: minDate.toISOString().split("T")[0],
    maxDate: maxDate.toISOString().split("T")[0],
  }
}

module.exports = { mapAsignatura, getDateRange }
