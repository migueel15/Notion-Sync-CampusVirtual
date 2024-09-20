# Notion - CampusVirtual UMA - Sync

Sincronización automática entre el campus virtual de la uma y tu base de datos en notion.

## Configurar Notion

Las tareas se importarán a una base de datos de Notion, por lo que es necesario que esta tenga unos campos específicos.

Puedes usar esta [plantilla](https://miguedm.notion.site/a935199cb79341c29c043fa14716d61f?v=478c66d1354a47a28180f45ce807ab64) para clonar la base de datos o cambiar/añadir los campos necesarios en la tuya.

> Es importante que la base de datos tenga estos campos con el tipo y nombre correcto

## Ejecutar contenedor

```bash
DBUS_PATH=$(echo $DBUS_SESSION_BUS_ADDRESS | cut -d= -f2-)
docker run -d \
	--name notion-sync-cv \
	--user $(id -u):$(id -g) \
	--restart=unless-stopped \
	-v $DBUS_PATH:$DBUS_PATH \
	-e DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS \
	-e CALENDAR_URL=TU_CALENDAR_URL \
	-e NOTION_API_KEY=TU_NOTION_API_KEY \
	-e NOTION_DATABASE_ID=TU_NOTION_DATABASE_ID \
	-e SLEEP_TIME=TU_SLEEP_TIME \
	migueel15/notion-sync-cv:latest
```

## Variables de entorno

CALENDAR_URL: URL del calendario del campus virtual de la UMA.
NOTION_API_KEY: API key de notion.
NOTION_DATABASE_ID: ID de la base de datos de notion.
SLEEP_TIME: Tiempo de espera entre sincronizaciones(en segundos).

## Obtener variables de entorno

### CALENDAR_URL

Ve al campus virtual de la UMA y copia la URL del calendario.
![calendar_url](./docs/assets/url_campus.gif)

### NOTION_API_KEY
