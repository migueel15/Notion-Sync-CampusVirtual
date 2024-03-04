// como maximo 60 dias
const dateRange = {
  startDate: 2,
  endDate: 60,
}

// mapeo del nombre de las asignaturas
// Nombre en CV : Nombre Custom Notion
const asignaturas = {
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
  IntIng: "Software"
}

// nombres de las propiedades de la base de datos en notion
const propiedades = {
  nombre: "Nombre de tarea", // nombre tarea
  asignatura: "Asignatura", // select de asignaturas
  descripcion: "Descripcion", // descripcion
  fecha: "Fecha", // fecha
  from: "From", // select (CV?)
  cv: "cv-id", // plan text id de la tarea
  tipo: "Tipo", // select (Tarea, Examen, etc)
}

exports.dateRange = dateRange
exports.asignaturas = asignaturas
exports.propiedades = propiedades
