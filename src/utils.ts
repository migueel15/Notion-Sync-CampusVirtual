import { dateRange, asignaturas } from "./config"

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

export function getDateRange() {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const minDate = new Date(today)
	minDate.setDate(today.getDate() - dateRange.startOffset)

	const maxDate = new Date(today)
	maxDate.setDate(today.getDate() + dateRange.endOffset - 1)

	return {
		minDate: minDate.toISOString(),
		maxDate: maxDate.toISOString(),
	}
}

export function fromUTCtoLocal(date) {
	const timestamp = new Date(date)
	const offset = (timestamp.getTimezoneOffset() / 60) * -1
	timestamp.setHours(timestamp.getHours() + offset)
	return timestamp
}

export function fromLocalToUTC(date) {
	const timestamp = new Date(date)
	const offset = (timestamp.getTimezoneOffset() / 60) * -1
	timestamp.setHours(timestamp.getHours() - offset)
	return timestamp
}

