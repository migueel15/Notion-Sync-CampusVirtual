import { getCvEvents } from "./calendar.js"
import {
	createEvent,
	deleteNotionEvents,
	queryEventsFromNotion,
	updateEvent,
} from "./notion.js"
import { Evento, UserData } from "./types.js"
import { logError, logInfo } from "./logger.js"

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
					(event as any).notion_id = eventInNotion.notion_id

					if (
						eventInNotion.title !== event.title ||
						eventInNotion.UTCStart !== event.UTCStart ||
						eventInNotion.UTCEnd !== event.UTCEnd ||
						eventInNotion.description !== event.description ||
						eventInNotion.subject !== event.subject
					) {
						await updateEvent(event, userData)
					}
				} else {
					await createEvent(event, userData)
				}
			} catch (error) {
				logError('Error processing event', { context: 'sync', databaseId: userData.notiondatabaseid, eventTitle: event.title, error })
			}

			await new Promise(resolve => setTimeout(resolve, 100))
		}

		logInfo('Sync completed for user', { context: 'sync', databaseId: userData.notiondatabaseid, eventsProcessed: CVEvents.length })
	} catch (error) {
		logError('Error syncing user', { context: 'sync', databaseId: userData.notiondatabaseid, error })
		throw error
	}
}
