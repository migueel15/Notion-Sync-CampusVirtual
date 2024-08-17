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
	description?: string,
	UTCStart: string,
	UTCEnd?: string,
	LocalStart: string,
	LocalEnd?: string,
	subject?: string
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
