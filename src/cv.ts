import ICAL from "ical.js"
import { mapAsignatura, getDateRange } from "./utils"

const url = process.env.CALENDAR_URL || ""

const isInRange = (string: string) => {
	const datesRange = getDateRange()
	const date = string
	return date >= datesRange.minDate && date <= datesRange.maxDate
}

export async function getCvEvents() {
	const response = await fetch(url)

	let data = await response.text()
	let text: any[] = ICAL.parse(data)
	let events = text[2]
	let mappedEvents = events.map((event: any) => {
		const cv_id = event[1][0][3]
		const title = event[1][1][3]
		let asignatura = ""
		let descripcion = ""
		try {
			descripcion = event[1][2][3]

			if (descripcion.length > 2000) {
				descripcion = descripcion.slice(0, 1997)
				descripcion += "..."
			}

			asignatura = event[1][8][3]
			asignatura = mapAsignatura(asignatura)
		} catch (error) { }
		const startDate = new Date(event[1][6][3]).toISOString()
		//const startDate = timeZonedDate(event[1][6][3]).toISOString()
		const endDate = new Date(event[1][7][3]).toISOString()
		//const endDate = timeZonedDate(event[1][7][3]).toISOString()
		if (isInRange(startDate)) {
			return { title, cv_id, startDate, endDate, descripcion, asignatura }
		} else {
			return undefined
		}
	})
	mappedEvents = mappedEvents.filter((event) => event !== undefined)
	return mappedEvents
}
