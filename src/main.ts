import { Client, isFullPage } from "@notionhq/client"

import dotenv from "dotenv"
import { getCvEvents } from "./ical.js"
import {
	createEvent,
	deleteNotionEvents,
	queryEventsFromNotion,
	updateEvent,
} from "./notion.js"
import { Evento } from "./types.js"

dotenv.config()
const notion = new Client({ auth: process.env.NOTION_API_KEY })

const SLEEP_TIME: number = +process.env.SLEEP_TIME || 900
while (true) {
	const CVEvents = await getCvEvents()
	const NotionEvents = await queryEventsFromNotion()

	deleteNotionEvents(NotionEvents, CVEvents)

	CVEvents.forEach(async (event: Evento) => {
		const eventInNotion = NotionEvents.find(
			(notionEvent) => notionEvent.id === event.id,
		)
		if (eventInNotion) {
			event.notion_id = eventInNotion.notion_id
			if (
				eventInNotion.title !== event.title ||
				eventInNotion.UTCStart !== event.UTCStart ||
				eventInNotion.UTCEnd !== event.UTCEnd ||
				eventInNotion.description !== event.description ||
				eventInNotion.subject !== event.subject
			) {
				updateEvent(event)
			}
		} else {
			createEvent(event)
		}
	})

	await new Promise((resolve) => setTimeout(resolve, SLEEP_TIME * 1000))
}
