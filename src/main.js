const { Client } = require("@notionhq/client")
const path = require("path")
const dotenv = require("dotenv")
const envPath = path.resolve(__dirname, "../.env")
dotenv.config({ path: envPath })
const { getCvEvents } = require("./cv")
const { exec } = require("child_process")
const { getDateRange } = require("./utils")
const dates = getDateRange()

const notion = new Client({ auth: process.env.NOTION_API_KEY })

async function updateEvent(newEvent) {
  if (newEvent.descripcion === undefined) {
    newEvent.descripcion = ""
  }
  const response = await notion.pages.update({
    page_id: newEvent.id,
    properties: {
      "Nombre de tarea": {
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
      Descripcion: {
        rich_text: [
          {
            text: {
              content: newEvent.descripcion,
            },
          },
        ],
      },
      Fecha: {
        date: {
          start: newEvent.date,
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
        "Nombre de tarea": {
          title: [
            {
              text: {
                content: newEvent.title,
              },
            },
          ],
        },
        From: {
          select: {
            name: "CV",
          },
        },
        Descripcion: {
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
        "cv-id": {
          rich_text: [
            {
              text: {
                content: newEvent.cv_id,
              },
            },
          ],
        },
        Fecha: {
          date: {
            start: newEvent.startDate,
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
  const fechaFormateada = new Date(event.date).toLocaleString()
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
        property: "Fecha",
        date: {
          on_or_after: dates.minDate,
        },
      },
      {
        property: "Fecha",
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
    return page.properties["From"].select?.name == "CV"
  })
  const mappedList = fromCV.map((page) => {
    const title = page.properties["Nombre de tarea"].title[0].plain_text
    const id = page.id
    const cv_id = page.properties["cv-id"].rich_text[0]["plain_text"]
    const date = page.properties["Fecha"].date.start
    let descripcion = ""
    let asignatura = ""
    try {
      descripcion = page.properties["Descripcion"].rich_text[0]["plain_text"]
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
