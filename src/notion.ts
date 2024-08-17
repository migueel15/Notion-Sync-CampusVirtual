import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { Evento } from './types.js';
import { propiedades } from './config.js';
import { createNotification, differentStartEndDates, fromLocalToUTC, getDateRange } from './utils.js';
import { resolve } from 'path';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function createEvent(evento: Evento) {
	const response = await notion.pages.create({
		parent: {
			database_id: process.env.NOTION_DATABASE_ID
		},
		icon: {
			type: 'emoji',
			emoji: '🔵'
		},
		properties: {
			[propiedades.nombre]: {
				title: [
					{
						type: 'text',
						text: {
							content: evento.title
						}
					}
				]
			},
			[propiedades.from]: {
				select: {
					name: evento.from
				}
			},
			[propiedades.tipo]: {
				select: {
					name: "Tarea"
				}
			},
			[propiedades.descripcion]: {
				rich_text: [
					{
						type: 'text',
						text: {
							content: evento.description
						}
					}
				]
			},
			[propiedades.asignatura]: {
				select: {
					name: evento.subject
				}
			},
			[propiedades.fecha]: {
				date: {
					start: evento.LocalStart,
					end: differentStartEndDates(evento.LocalStart, evento.LocalEnd) ? evento.LocalEnd : null,
					time_zone: "Europe/Madrid"
				}
			},
			[propiedades.cv]: {
				rich_text: [
					{
						text: {
							content: evento.id
						}
					}
				]
			}
		}
	})
	if (response) {
		console.log("DATE: ", new Date().toISOString(), " - Created event: ", evento.title, " - ", evento.notion_id)
		createNotification(evento, "CREATED")
	}
}
export function updateEvent(evento: Evento) {
	const response = notion.pages.update({
		page_id: evento.notion_id,
		properties: {
			[propiedades.nombre]: {
				title: [
					{
						type: 'text',
						text: {
							content: evento.title
						}
					}
				]
			},
			[propiedades.from]: {
				select: {
					name: evento.from
				}
			},
			[propiedades.tipo]: {
				select: {
					name: "Tarea"
				}
			},
			[propiedades.descripcion]: {
				rich_text: [
					{
						type: 'text',
						text: {
							content: evento.description
						}
					}
				]
			},
			[propiedades.asignatura]: {
				select: {
					name: evento.subject
				}
			},
			[propiedades.fecha]: {
				date: {
					start: evento.LocalStart,
					end: differentStartEndDates(evento.LocalStart, evento.LocalEnd) ? evento.LocalEnd : null,
					time_zone: "Europe/Madrid"
				}
			},
			[propiedades.cv]: {
				rich_text: [
					{
						text: {
							content: evento.id
						}
					}
				]
			}
		}
	})
	if (response) {
		console.log("DATE: ", new Date().toISOString(), " - Updated event: ", evento.title, " - ", evento.notion_id)
		createNotification(evento, "UPDATED")
	}
}
export function deleteEvent(evento: Evento) {
	const response = notion.pages.update({
		page_id: evento.notion_id,
		archived: true
	})
	if (response) {
		console.log("DATE: ", new Date().toISOString(), " - Deleted event: ", evento.title, " - ", evento.notion_id)
		createNotification(evento, "DELETED")
	}
}

export async function queryEventsFromNotion(): Promise<Evento[]> {
	const response = await notion.databases.query({
		database_id: process.env.NOTION_DATABASE_ID,
		filter: {
			and: [
				{
					property: propiedades.from,
					select: {
						equals: "CV"
					}
				},
				{
					property: propiedades.fecha,
					date: {
						on_or_after: getDateRange().minDate,
					}
				},
				{
					property: propiedades.fecha,
					date: {
						on_or_before: getDateRange().maxDate,
					}
				}
			]
		}
	});
	if (response) {
		const NotionEvents: Evento[] = response.results.map((page: any) => {
			const localStart = page.properties[propiedades.fecha].date.start.substring(0, page.properties[propiedades.fecha].date.start.length - 10) + "Z"
			const localEnd = page.properties[propiedades.fecha].date.end === null ? localStart : page.properties[propiedades.fecha].date.end.substring(0, page.properties[propiedades.fecha].date.end.length - 10) + "Z"
			return {
				id: page.properties[propiedades.cv].rich_text[0].plain_text,
				title: page.properties[propiedades.nombre].title[0].plain_text,
				description: page.properties[propiedades.descripcion].rich_text[0].plain_text,
				UTCStart: fromLocalToUTC(localStart),
				UTCEnd: fromLocalToUTC(localEnd),
				LocalStart: localStart,
				LocalEnd: localEnd,
				subject: page.properties[propiedades.asignatura].select.name,
				from: page.properties[propiedades.from].select.name,
				notion_id: page.id
			}
		})

		return NotionEvents
	}
}

// delete events from Notion that are not in the CV
export function deleteNotionEvents(NotionEvents: Evento[], cvEvents: Evento[]) {
	const eventsToDelete = NotionEvents.filter((notionEvent) => {
		return notionEvent.id !== cvEvents.find((cvEvent) => cvEvent.id === notionEvent.id)?.id
	})
	eventsToDelete.forEach((event: Evento) => {
		deleteEvent(event)
	})
	if (eventsToDelete.length > 0) {
		console.log("DATE: ", new Date().toISOString(), " - Deleted events: ", eventsToDelete.length)
	}
}
