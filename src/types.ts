export type DateRange = {
	startOffset: number,
	endOffset: number
}

export type Evento = {
	id: string,
	title: string,
	description?: string,
	UTCStart: Date,
	UTCEnd?: Date,
	LocalStart: Date,
	LocalEnd?: Date,
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
