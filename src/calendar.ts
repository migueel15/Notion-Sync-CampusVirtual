import ICAL from "ical.js"
import {
	fromDateToString,
	fromUTCtoLocal,
	getDateRange,
	mapAsignatura,
} from "./utils.js"

import dotenv from "dotenv"
dotenv.config()

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

const getSubject = (subject: string) => {
	if (!subject) return ""
	try {
		return mapAsignatura(subject)
	} catch (error) { }
	return subject
}

export async function getCvEvents(calendarUrl?: string) {
	const CALENDAR_URL = calendarUrl || process.env.CALENDAR_URL || ""
	try {
		const res = await fetch(CALENDAR_URL)
		const data = await res.text()

		const parsedData = ICAL.parse(data)
		const calendar = new ICAL.Component(parsedData)

		const events = calendar.getAllSubcomponents("vevent")

		const mappedEvents = events.map((event) => {
			const id = event.getFirstProperty("uid")?.getFirstValue() as string
			const title = event.getFirstProperty("summary")?.getFirstValue() as string
			const description = event.getFirstProperty("description")?.getFirstValue() as string
			const startDateObject = event.getFirstProperty("dtstart")?.getFirstValue() as ICAL.Time
			const endDateObject = event.getFirstProperty("dtend")?.getFirstValue() as ICAL.Time
			const startDate = startDateObject.toJSDate()
			const endDate = endDateObject.toJSDate()
			const subject = event.getFirstProperty("categories")?.getFirstValue() as string

			if (isInRange(fromDateToString(startDate))) {
				return undefined
			}

			return {
				title,
				id,
				description: formatDescription(description) || "",
				UTCStart: startDate.toISOString(),
				UTCEnd: endDate.toISOString(),
				subject: getSubject(subject) || "Sin asignar",
				from: "CV",
			}
		}).filter((e) => e !== undefined)
		return mappedEvents
	} catch (error) {
		throw new Error(
			"Error al obtener los eventos del calendario, comprueba la URL del calendario",
		)
	}
}
