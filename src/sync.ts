import { getCvEvents, isInRange } from "./calendar.js";
import {
  createEvent,
  deleteNotionEvents,
  queryEventsFromNotion,
  updateEvent,
} from "./notion.js";
import { UserData } from "./types.js";
import { logError, logInfo, logWarn } from "./logger.js";

export async function syncUser(userData: UserData) {
  if (!userData?.notionapikey || !userData.notiondatabaseid || !userData.calendarurl) {
    throw new Error("Missing required fields: notionapikey, notiondatabaseid, calendarurl");
  }

  try {
    const CVEvents = (await getCvEvents(userData.calendarurl)).filter((e) =>
      isInRange(e.UTCStart),
    );
    const NotionEvents = (await queryEventsFromNotion(userData)).filter((e) =>
      isInRange(e.UTCStart),
    );

    const { deletedCount, failedCount } = await deleteNotionEvents(
      NotionEvents,
      CVEvents,
      userData,
    );
    let eventsProcessed = deletedCount;
    let eventsFailed = failedCount;

    for (const event of CVEvents) {
      const eventInNotion = NotionEvents.find(
        (notionEvent) => notionEvent.id === event.id,
      );

      try {
        if (eventInNotion) {
          (event as any).notion_id = eventInNotion.notion_id;

          if (
            eventInNotion.title !== event.title ||
            eventInNotion.UTCStart !== event.UTCStart ||
            eventInNotion.UTCEnd !== event.UTCEnd ||
            eventInNotion.description !== event.description ||
            eventInNotion.subject !== event.subject
          ) {
            await updateEvent(event, userData);
          }
        } else {
          await createEvent(event, userData);
        }
        eventsProcessed++;
      } catch (error) {
        eventsFailed++;
        logError("Error processing event", {
          context: "sync",
          databaseId: userData.notiondatabaseid,
          eventId: event.id,
          eventTitle: event.title,
          error,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const result = { eventsProcessed, eventsFailed };
    const meta = {
      context: "sync",
      databaseId: userData.notiondatabaseid,
      ...result,
    };
    if (eventsFailed > 0) {
      logWarn("Sync completed with event failures", meta);
    } else {
      logInfo("Sync completed for user", meta);
    }
    return result;
  } catch (error) {
    logError("Error syncing user", {
      context: "sync",
      databaseId: userData.notiondatabaseid,
      error,
    });
    throw error;
  }
}
