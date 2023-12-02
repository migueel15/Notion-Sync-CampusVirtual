const { Client } = require("@notionhq/client")
const path = require("path")
const dotenv = require("dotenv")
const envPath = path.resolve(__dirname, "../.env")
dotenv.config({ path: envPath })
const { getCvEvents } = require("./cv")
const { exec } = require("child_process")
const { getDateRange, fromLocalToUTC, fromUTCtoLocal } = require("./utils")
const dates = getDateRange()
const { propiedades } = require("./config")

const notion = new Client({ auth: process.env.NOTION_API_KEY })

async function updateEvent(newEvent) {
  if (newEvent.descripcion === undefined) {
    newEvent.descripcion = ""
  }
  await notion.pages.update({
    page_id: newEvent.id,
    properties: {
      [propiedades.nombre]: {
        title: [
          {
            text: {
              content: newEvent.title,
            },
          },
        ],
      },
      Asignatura: {
        select: {
          name: newEvent.asignatura,
        },
      },
      [propiedades.descripcion]: {
        rich_text: [
          {
            text: {
              content: newEvent.descripcion,
            },
          },
        ],
      },
      [propiedades.fecha]: {
        date: {
          start: fromUTCtoLocal(newEvent.date),
          time_zone: "Europe/Madrid",
        },
      },
    },
  })

  const fechaFormateada = new Date(newEvent.date).toLocaleString()
  try {
    exec(
      `notify-send -c "notion-event" '<b>Notion - Evento actualizado</b>' '${newEvent.asignatura}\n${newEvent.title}\n${fechaFormateada}'`
    )
  } catch {}
}

async function createEvent(newEvent) {
  if (newEvent.descripcion === undefined) {
    newEvent.descripcion = ""
  }
  if (newEvent.asignatura === "") {
    newEvent.asignatura = " "
  }
  try {
    await notion.pages.create({
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
              text: {
                content: newEvent.title,
              },
            },
          ],
        },
        [propiedades.from]: {
          select: {
            name: "CV",
          },
        },
        [propiedades.descripcion]: {
          rich_text: [
            {
              text: {
                content: newEvent.descripcion,
              },
            },
          ],
        },
        Asignatura: {
          select: {
            name: newEvent.asignatura,
          },
        },
        [propiedades.cv]: {
          rich_text: [
            {
              text: {
                content: newEvent.cv_id,
              },
            },
          ],
        },
        [propiedades.fecha]: {
          date: {
            start: fromUTCtoLocal(newEvent.startDate),
            time_zone: "Europe/Madrid",
          },
        },
      },
    })

    const fechaFormateada = new Date(newEvent.startDate).toLocaleString()
    try {
      exec(
        `notify-send -c "notion-event" '<b>Notion - Nuevo evento</b>' '${newEvent.asignatura}\n${newEvent.title}\n${fechaFormateada}'`
      )
    } catch {}
  } catch (error) {
    exec(
      `notify-send -c "notion-event" '<b>Notion - Error</b>' 'No se ha podido crear: ${newEvent.title}\n${error.message}'`
    )
  }
}

async function deleteEvent(event) {
  await notion.pages.update({
    page_id: event.id,
    archived: true,
  })
  const fechaFormateada = new Date(newEvent.startDate).toLocaleString()
  try {
    exec(
      `notify-send -c "notion-event" '<b>Notion - Evento borrado</b>' '${event.asignatura}\n${event.title}\n${fechaFormateada}'`
    )
  } catch {}
}

const response = notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    and: [
      {
        property: propiedades.fecha,
        date: {
          on_or_after: dates.minDate,
        },
      },
      {
        property: propiedades.fecha,
        date: {
          on_or_before: dates.maxDate,
        },
      },
    ],
  },
})
response.then(async (res) => {
  const list = res.results
  const fromCV = list.filter((page) => {
    return page.properties[[propiedades.from]].select?.name == "CV"
  })
  const mappedList = fromCV.map((page) => {
    const title = page.properties[[propiedades.nombre]].title[0].plain_text
    const id = page.id
    const cv_id = page.properties[[propiedades.cv]].rich_text[0]["plain_text"]
    let date = page.properties[[propiedades.fecha]].date.start
    date = date.substring(0, date.length - 6) + "Z"
    date = fromLocalToUTC(date).toISOString()
    let descripcion = ""
    let asignatura = ""
    try {
      descripcion =
        page.properties[[propiedades.descripcion]].rich_text[0]["plain_text"]
      asignatura = page.properties["Asignatura"].select.name
    } catch (error) {}
    return { title, id, cv_id, date, descripcion, asignatura }
  })
  let eventsDeleted = mappedList

  const eventsFromCv = await getCvEvents()
  eventsFromCv.map((event) => {
    let found = false
    let outdate = false
    const { title, cv_id, startDate, descripcion, asignatura } = event
    const notionEvent = mappedList.find((page) => page.cv_id == cv_id)
    if (notionEvent) {
      eventsDeleted = eventsDeleted.filter((page) => page.cv_id !== cv_id)
      found = true
      if (notionEvent.title != title) {
        notionEvent.title = title
        outdate = true
      }
      if (notionEvent.descripcion !== descripcion) {
        notionEvent.descripcion = descripcion
        outdate = true
      }
      if (notionEvent.asignatura !== asignatura) {
        notionEvent.asignatura = asignatura
        outdate = true
      }
      if (notionEvent.date !== startDate) {
        console.log("notion: ", notionEvent.date, " ", "cv: ", startDate)
        notionEvent.date = startDate
        outdate = true
      }
    }
    if (found) {
      outdate ? updateEvent(notionEvent) : null
    } else {
      createEvent(event)
    }
  })
  eventsDeleted.map((event) => {
    deleteEvent(event)
  })
})
