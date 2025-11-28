import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { Evento, UserData } from "./types.js";
import { propiedades } from "./config.js";
import {
  createNotification,
  differentStartEndDates,
  fromUTCtoLocal,
  getDateRange,
} from "./utils.js";
import { withRetry } from "./utils/retry.js";
import { logError, logInfo } from "./logger.js";

dotenv.config();

export async function createEvent(evento: Evento, userData: UserData) {
  const notion = new Client({ auth: userData.notionapikey });
  
  return withRetry(async () => {
    const response = await notion.pages.create({
      parent: {
        database_id: userData.notiondatabaseid,
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
            start: fromUTCtoLocal(evento.UTCStart),
            end: differentStartEndDates(evento.UTCStart, evento.UTCEnd)
              ? fromUTCtoLocal(evento.UTCEnd)
              : null,
            time_zone: "Europe/Madrid",
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
    });
    if (response) {
      logInfo("Created event in Notion", {
        context: "notion",
        databaseId: userData.notiondatabaseid,
        eventId: evento.id,
        eventTitle: evento.title,
        notionId: response.id
      });
      createNotification(evento, "CREATED");
    }
  });
}
export async function updateEvent(evento: Evento, userData: UserData) {
  const notion = new Client({ auth: userData.notionapikey });
  
  return withRetry(async () => {
    const response = await notion.pages.update({
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
            start: fromUTCtoLocal(evento.UTCStart),
            end: differentStartEndDates(evento.UTCStart, evento.UTCEnd)
              ? fromUTCtoLocal(evento.UTCEnd)
              : null,
            time_zone: "Europe/Madrid",
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
    });
    if (response) {
      logInfo("Updated event in Notion", {
        context: "notion",
        databaseId: userData.notiondatabaseid,
        eventId: evento.id,
        eventTitle: evento.title,
        notionId: evento.notion_id
      });
      createNotification(evento, "UPDATED");
    }
  });
}
export async function deleteEvent(evento: Evento, userData: UserData) {
  const notion = new Client({ auth: userData.notionapikey });
  
  return withRetry(async () => {
    const response = await notion.pages.update({
      page_id: evento.notion_id,
      archived: true,
    });
    if (response) {
      logInfo("Deleted event in Notion", {
        context: "notion",
        databaseId: userData.notiondatabaseid,
        eventId: evento.id,
        eventTitle: evento.title,
        notionId: evento.notion_id
      });
      createNotification(evento, "DELETED");
    }
  });
}

export async function queryEventsFromNotion(userData: UserData): Promise<Evento[]> {
  const notion = new Client({ auth: userData.notionapikey });
  try {
    const response = await notion.databases.query({
      database_id: userData.notiondatabaseid,
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
    });
    if (response) {
      const NotionEvents: Evento[] = response.results.map((page: any) => {
        const UTCStart = new Date(
          page.properties[propiedades.fecha].date.start,
        ).toISOString();
        const UTCEnd =
          page.properties[propiedades.fecha].date.end === null
            ? UTCStart
            : new Date(
              page.properties[propiedades.fecha].date.end,
            ).toISOString();
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
        };
      });

      return NotionEvents;
    }
  } catch (error) {
    throw new Error("Error querying events from Notion: " + error);
  }
}

// delete events from Notion that are not in the CV
export async function deleteNotionEvents(NotionEvents: Evento[], cvEvents: Evento[], userData: UserData) {
  try {
    const eventsToDelete = NotionEvents.filter((notionEvent) => {
      return (
        notionEvent.id !==
        cvEvents.find((cvEvent) => cvEvent.id === notionEvent.id)?.id
      );
    });
    
    for (const event of eventsToDelete) {
      await deleteEvent(event, userData);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (eventsToDelete.length > 0) {
      logInfo("Deleted orphaned Notion events", {
        context: "notion",
        databaseId: userData.notiondatabaseid,
        deletedCount: eventsToDelete.length
      });
    }
  } catch (error) {
    logError("Error deleting events from Notion", { context: "notion", databaseId: userData.notiondatabaseid, error });
  }
}
