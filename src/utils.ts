import { dateOffsetRange, asignaturas } from "./config.js"
import { DateRange } from "./types.js"

export function mapAsignatura(longName: string): string {
	const claves = Object.keys(asignaturas)
	for (let i = 0; i < claves.length; i++) {
		if (longName.includes(claves[i])) {
			const clave = claves[i]
			return asignaturas[clave]
		}
	}
	return longName
}

export function getDateRange(): DateRange {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const minDate = new Date(today)
	minDate.setDate(today.getDate() - dateOffsetRange.startOffset)

	const maxDate = new Date(today)
	maxDate.setDate(today.getDate() + dateOffsetRange.endOffset - 1)

	return {
		minDate: minDate.toISOString(),
		maxDate: maxDate.toISOString(),
	}
}

export function fromUTCtoLocal(date: string): string {
	const timestamp = new Date(date)
	const offset = (timestamp.getTimezoneOffset() / 60) * -1
	timestamp.setHours(timestamp.getHours() + offset)
	let localDate = timestamp.toISOString()
	return localDate.substring(0, localDate.length - 5) + "Z"
}

export function fromLocalToUTC(date: string): string {
	const timestamp = new Date(date)
	const offset = (timestamp.getTimezoneOffset() / 60) * -1
	timestamp.setHours(timestamp.getHours() - offset)
	return timestamp.toISOString()
}

export function fromDateToString(date: Date): string {
	const timestamp = new Date(date)
	let stringDate = timestamp.toISOString()
	return stringDate.substring(0, stringDate.length - 5) + "Z"
}
