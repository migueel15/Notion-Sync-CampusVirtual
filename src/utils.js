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
  today.setHours(0, 0, 0, 0)

  const minDate = new Date(today)
  minDate.setDate(today.getDate() - dateRange.startDate)

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + dateRange.endDate - 1)

  return {
    minDate: minDate.toISOString(),
    maxDate: maxDate.toISOString(),
  }
}

function fromUTCtoLocal(date) {
  const timestamp = new Date(date)
  const offset = (timestamp.getTimezoneOffset() / 60) * -1
  timestamp.setHours(timestamp.getHours() + offset)
  return timestamp
}

function fromLocalToUTC(date) {
  const timestamp = new Date(date)
  const offset = (timestamp.getTimezoneOffset() / 60) * -1
  timestamp.setHours(timestamp.getHours() - offset)
  return timestamp
}

module.exports = { mapAsignatura, getDateRange, fromUTCtoLocal, fromLocalToUTC }
