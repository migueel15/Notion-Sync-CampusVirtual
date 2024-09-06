export type State = "CREATED" | "UPDATED" | "DELETED" | "ERROR"

export type DateOffsetRange = {
	startOffset: number,
	endOffset: number
}

export type DateRange = {
	minDate: string,
	maxDate: string
}

export type Evento = {
	id: string,
	title: string,
	from: string,
	description?: string,
	UTCStart: string,
	UTCEnd?: string,
	subject?: string,
	notion_id?: string
}

export type NotionPropertieLabels = {
	nombre: string,
	asignatura: string,
	descripcion: string,
	fecha: string,
	from: string,
	cv: string,
	tipo: string
}
