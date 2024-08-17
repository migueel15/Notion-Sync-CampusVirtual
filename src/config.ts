import { DateOffsetRange, NotionPropertieLabels } from "./types.js"

// startOffset maximo 5 dias
// endOffset maximo 60 dias
export const dateOffsetRange: DateOffsetRange = {
	startOffset: 3,
	endOffset: 60,
}

// mapeo del nombre de las asignaturas
// Nombre en CV : Nombre Custom Notion
export const asignaturas: { [longName: string]: string } = {
	FunEle: "Electronica",
	"Cálculo para la Computación": "Calculo",
	EstDat: "ED",
	EstCom: "EC",
	AnaDis: "ADA",
	TeoAut: "TALF",
	BasDat: "BD",
	RedSis: "Redes",
	SisInt: "SI",
	SisOpe: "SO",
	IntIng: "Software",
	ProSisCon: "Concurrencia"
}

// nombres de las propiedades de la base de datos en notion
export const propiedades: NotionPropertieLabels = {
	nombre: "Nombre de tarea", // nombre tarea
	asignatura: "Asignatura", // select de asignaturas
	descripcion: "Descripcion", // descripcion
	fecha: "Fecha", // fecha
	from: "From", // select (CV?)
	cv: "cv-id", // plan text id de la tarea
	tipo: "Tipo", // select (Tarea, Examen, etc)
}
