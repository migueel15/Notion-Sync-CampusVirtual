import { Client } from "@notionhq/client"
import dotenv from "dotenv"
import { Evento } from "./types.js"
import { propiedades } from "./config.js"
import {
	createNotification,
	differentStartEndDates,
	fromLocalToUTC,
	getDateRange,
} from "./utils.js"
import { resolve } from "path"

dotenv.config()

let notion: Client
try {
	notion = new Client({ auth: process.env.NOTION_API_KEY })
} catch (error) {
	throw new Error("Error initializing Notion client. Comprueba tu token.")
}

export async function createEvent(evento: Evento) {
	try {
		const response = await notion.pages.create({
			parent: {
				database_id: process.env.NOTION_DATABASE_ID,
			},
			icon: {
				type: "emoji",
				emoji: "🔵",
			},
			properties: {
				[propiedades.nombre]: {
					title: [
						{
							type: "text",
							text: {
								content: evento.title,
							},
						},
					],
				},
				[propiedades.from]: {
					select: {
						name: evento.from,
					},
				},
				[propiedades.tipo]: {
					select: {
						name: "Tarea",
					},
				},
				[propiedades.descripcion]: {
					rich_text: [
						{
							type: "text",
							text: {
								content: evento.description,
							},
						},
					],
				},
				[propiedades.asignatura]: {
					select: {
						name: evento.subject,
					},
				},
				[propiedades.fecha]: {
					date: {
						start: evento.UTCStart,
						end: differentStartEndDates(evento.UTCStart, evento.UTCEnd)
							? evento.UTCEnd
							: null,
					},
				},
				[propiedades.cv]: {
					rich_text: [
						{
							text: {
								content: evento.id,
							},
						},
					],
				},
			},
		})
		if (response) {
			console.log(
				"DATE: ",
				new Date().toISOString(),
				" - Created event: ",
				evento.title,
				" - ",
				evento.notion_id,
			)
			createNotification(evento, "CREATED")
		}
	} catch (error) {
		throw new Error(
			"Error creating event: " +
			evento.title +
			" - " +
			evento.notion_id +
			"\n" +
			error,
		)
	}
}
export function updateEvent(evento: Evento) {
	try {
		const response = notion.pages.update({
			page_id: evento.notion_id,
			properties: {
				[propiedades.nombre]: {
					title: [
						{
							type: "text",
							text: {
								content: evento.title,
							},
						},
					],
				},
				[propiedades.from]: {
					select: {
						name: evento.from,
					},
				},
				[propiedades.tipo]: {
					select: {
						name: "Tarea",
					},
				},
				[propiedades.descripcion]: {
					rich_text: [
						{
							type: "text",
							text: {
								content: evento.description,
							},
						},
					],
				},
				[propiedades.asignatura]: {
					select: {
						name: evento.subject,
					},
				},
				[propiedades.fecha]: {
					date: {
						start: evento.UTCStart,
						end: differentStartEndDates(evento.UTCStart, evento.UTCEnd)
							? evento.UTCEnd
							: null,
					},
				},
				[propiedades.cv]: {
					rich_text: [
						{
							text: {
								content: evento.id,
							},
						},
					],
				},
			},
		})
		if (response) {
			console.log(
				"DATE: ",
				new Date().toISOString(),
				" - Updated event: ",
				evento.title,
				" - ",
				evento.notion_id,
			)
			createNotification(evento, "UPDATED")
		}
	} catch (error) {
		throw new Error(
			"Error updating event: " +
			evento.title +
			" - " +
			evento.notion_id +
			"\n" +
			error,
		)
	}
}
export function deleteEvent(evento: Evento) {
	try {
		const response = notion.pages.update({
			page_id: evento.notion_id,
			archived: true,
		})
		if (response) {
			console.log(
				"DATE: ",
				new Date().toISOString(),
				" - Deleted event: ",
				evento.title,
				" - ",
				evento.notion_id,
			)
			createNotification(evento, "DELETED")
		}
	} catch (error) {
		throw new Error(
			"Error deleting event: " +
			evento.title +
			" - " +
			evento.notion_id +
			"\n" +
			error,
		)
	}
}

export async function queryEventsFromNotion(): Promise<Evento[]> {
	try {
		const response = await notion.databases.query({
			database_id: process.env.NOTION_DATABASE_ID,
			filter: {
				and: [
					{
						property: propiedades.from,
						select: {
							equals: "CV",
						},
					},
					{
						property: propiedades.fecha,
						date: {
							on_or_after: getDateRange().minDate,
						},
					},
					{
						property: propiedades.fecha,
						date: {
							on_or_before: getDateRange().maxDate,
						},
					},
				],
			},
		})
		if (response) {
			const NotionEvents: Evento[] = response.results.map((page: any) => {
				const UTCStart = new Date(
					page.properties[propiedades.fecha].date.start,
				).toISOString()
				const UTCEnd =
					page.properties[propiedades.fecha].date.end === null
						? UTCStart
						: new Date(
							page.properties[propiedades.fecha].date.end,
						).toISOString()
				return {
					id: page.properties[propiedades.cv].rich_text[0].plain_text,
					title: page.properties[propiedades.nombre].title[0].plain_text,
					description:
						page.properties[propiedades.descripcion].rich_text[0].plain_text,
					UTCStart,
					UTCEnd,
					subject: page.properties[propiedades.asignatura].select.name,
					from: page.properties[propiedades.from].select.name,
					notion_id: page.id,
				}
			})

			return NotionEvents
		}
	} catch (error) {
		throw new Error("Error querying events from Notion: " + error)
	}
}

// delete events from Notion that are not in the CV
export function deleteNotionEvents(NotionEvents: Evento[], cvEvents: Evento[]) {
	try {
		const eventsToDelete = NotionEvents.filter((notionEvent) => {
			return (
				notionEvent.id !==
				cvEvents.find((cvEvent) => cvEvent.id === notionEvent.id)?.id
			)
		})
		eventsToDelete.forEach((event: Evento) => {
			deleteEvent(event)
		})
		if (eventsToDelete.length > 0) {
			console.log(
				"DATE: ",
				new Date().toISOString(),
				" - Deleted events: ",
				eventsToDelete.length,
			)
		}
	} catch (error) {
		console.error("Error deleting events from Notion: ", error)
	}
}
