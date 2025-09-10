import { getCvEvents } from "./calendar.js"
import {
	createEvent,
	deleteNotionEvents,
	queryEventsFromNotion,
	updateEvent,
} from "./notion.js"
import { Evento, UserData } from "./types.js"

export async function syncUser(userData: UserData): Promise<void> {
	try {
		const CVEvents = await getCvEvents(userData.calendarurl)
		const NotionEvents = await queryEventsFromNotion(userData)

		await deleteNotionEvents(NotionEvents, CVEvents, userData)

		for (const event of CVEvents) {
			const eventInNotion = NotionEvents.find(
				(notionEvent) => notionEvent.id === event.id,
			)
			
			try {
				if (eventInNotion) {
					event.notion_id = eventInNotion.notion_id

					if (
						eventInNotion.title !== event.title ||
						eventInNotion.UTCStart !== event.UTCStart ||
						eventInNotion.UTCEnd !== event.UTCEnd ||
						eventInNotion.description !== event.description
					) {
						await updateEvent(event, userData)
					}
				} else {
					await createEvent(event, userData)
				}
			} catch (error) {
				console.error(`Error processing event ${event.title}:`, error)
			}

			await new Promise(resolve => setTimeout(resolve, 100))
		}

		console.log(`Sync completed for user with database: ${userData.notiondatabaseid}`)
	} catch (error) {
		console.error(`Error syncing user with database ${userData.notiondatabaseid}:`, error)
		throw error
	}
}