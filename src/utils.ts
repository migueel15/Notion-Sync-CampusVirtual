import path from "path";
import { dateOffsetRange, asignaturas } from "./config.js";
import { DateRange, Evento, State } from "./types.js";
import notifier from "node-notifier";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtener el equivalente a `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(dirname(__filename), "..");

export function mapAsignatura(longName: string): string {
  const claves = Object.keys(asignaturas);
  for (let i = 0; i < claves.length; i++) {
    if (longName.includes(claves[i])) {
      const clave = claves[i];
      return asignaturas[clave];
    }
  }
  return longName;
}

export function getDateRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - dateOffsetRange.startOffset);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + dateOffsetRange.endOffset - 1);

  return {
    minDate: minDate.toISOString(),
    maxDate: maxDate.toISOString(),
  };
}

export function fromUTCtoLocal(date: string): string {
  const timestamp = new Date(date);
  const offset = (timestamp.getTimezoneOffset() / 60) * -1;
  timestamp.setHours(timestamp.getHours() + offset);
  let localDate = timestamp.toISOString();
  return localDate.substring(0, localDate.length - 5) + "Z";
}

export function fromLocalToUTC(date: string): string {
  const timestamp = new Date(date);
  const offset = (timestamp.getTimezoneOffset() / 60) * -1;
  timestamp.setHours(timestamp.getHours() - offset);
  return timestamp.toISOString();
}

export function fromDateToString(date: Date): string {
  const timestamp = new Date(date);
  let stringDate = timestamp.toISOString();
  return stringDate.substring(0, stringDate.length - 5) + "Z";
}

export function differentStartEndDates(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate.getTime() !== endDate.getTime();
}

export function createNotification(event: Evento, state: State) {
  switch (state) {
    case "CREATED":
      notifyCreated(event);
      break;
    case "UPDATED":
      notifyUpdated(event);
      break;
    case "DELETED":
      notifyDeleted(event);
      break;
    case "ERROR":
      notifyError(event);
      break;
  }
}
function notifyCreated(event: Evento) {
  notifier.notify({
    title: "Evento creado [" + event.title + "]",
    message:
      "Asignatura: " +
      event.subject +
      "\n" +
      new Date(event.UTCStart).toLocaleString() +
      (differentStartEndDates(event.UTCStart, event.UTCEnd)
        ? " -> " + new Date(event.UTCEnd).toLocaleString()
        : ""),
    sound: true,
    timeout: 10,
    "app-name": "NotionSyncCV",
    icon: path.join(__dirname, "assets", "notion-logo.svg"),
  });
}
function notifyUpdated(event: Evento) {
  notifier.notify({
    title: "Evento actualizado [" + event.title + "]",
    message:
      "Asignatura: " +
      event.subject +
      "\n" +
      new Date(event.UTCStart).toLocaleString() +
      (differentStartEndDates(event.UTCStart, event.UTCEnd)
        ? " -> " + new Date(event.UTCEnd).toLocaleString()
        : ""),
    sound: true,
    timeout: 10,
    "app-name": "NotionSyncCV",
    icon: path.join(__dirname, "assets", "notion-logo.svg"),
  });
}
function notifyDeleted(event: Evento) {
  notifier.notify({
    title: "Evento borrado [" + event.title + "]",
    message:
      "Asignatura: " +
      event.subject +
      "\n" +
      new Date(event.UTCStart).toLocaleString() +
      (differentStartEndDates(event.UTCStart, event.UTCEnd)
        ? " -> " + new Date(event.UTCEnd).toLocaleString()
        : ""),
    sound: true,
    timeout: 10,
    "app-name": "NotionSyncCV",
    icon: path.join(__dirname, "assets", "notion-logo.svg"),
  });
}
function notifyError(event: Evento) {
  notifier.notify({
    title: "Evento creado [" + event.title + "]",
    message:
      "Asignatura: " +
      event.subject +
      "\n" +
      new Date(event.UTCStart).toLocaleString() +
      " -> " +
      new Date(event.UTCEnd).toLocaleString(),
    sound: true,
    timeout: 10,
    "app-name": "NotionSyncCV",
    icon: path.join(__dirname, "assets", "notion-logo.svg"),
  });
}
