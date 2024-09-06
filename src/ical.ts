import ICAL from "ical.js"
import { Evento } from "./types.js"
import {
	fromDateToString,
	fromUTCtoLocal,
	getDateRange,
	mapAsignatura,
} from "./utils.js"

const isInRange = (string: string) => {
	const datesRange = getDateRange()
	const date = string
	return date >= datesRange.minDate && date <= datesRange.maxDate
}

const formatDescription = (description: string) => {
	if (description.length > 2000) {
		description = description.substring(0, 1997)
		description += "..."
	}
	return description
}

const getSubject = (event: string) => {
	let subject = ""
	try {
		subject = event[1][8][3]
		subject = mapAsignatura(subject)
	} catch (error) {
	}
	return subject
}

export async function getCvEvents() {
	const CALENDAR_URL = process.env.CALENDAR_URL || ""
	try {

		const response = await fetch(CALENDAR_URL)
		let text = await response.text()
		let data: any[] = ICAL.parse(text)
		let events: string[] = data[2]

		let mappedEvents: Evento[] = events
			.map((event: any) => {
				if (!isInRange(fromDateToString(new Date(event[1][6][3])))) {
					return undefined
				}
				return {
					title: event[1][1][3],
					id: event[1][0][3],
					description: formatDescription(event[1][2][3]),
					UTCStart: new Date(event[1][6][3]).toISOString(),
					UTCEnd: new Date(event[1][7][3]).toISOString(),
					subject: getSubject(event) || "Sin asignar",
					from: "CV",
				}
			})
			.filter((event) => event !== undefined)
		return mappedEvents
	} catch (error) {
		throw new Error("Error al obtener los eventos del calendario, comprueba la URL del calendario")
	}
}
