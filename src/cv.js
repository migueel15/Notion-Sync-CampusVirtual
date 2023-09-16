const url = process.env.CALENDAR_URL
const ics = require("ical.js")
const { getAsignatura } = require("./subjects")

const timeZonedDate = (date) => {
  const timestamp = new Date(date)
  timestamp.setMinutes(timestamp.getMinutes() + 120)
  return timestamp
}

async function getCvEvents() {
  const response = await fetch(url)

  data = await response.text()
  data = ics.parse(data)
  events = data[2]
  const mappedEvents = events.map((event) => {
    const cv_id = event[1][0][3]
    const title = event[1][1][3]
    let asignatura = ""
    let descripcion = ""
    try {
      descripcion = event[1][2][3]
      asignatura = event[1][8][3]
      asignatura = getAsignatura(asignatura)
    } catch (error) {}
    const startDate = timeZonedDate(event[1][6][3])
      .toISOString()
      .replace("Z", "+02:00")
    const endDate = timeZonedDate(event[1][7][3])
      .toISOString()
      .replace("Z", "+02:00")

    return { title, cv_id, startDate, endDate, descripcion, asignatura }
  })
  return mappedEvents
}

module.exports = { getCvEvents }
