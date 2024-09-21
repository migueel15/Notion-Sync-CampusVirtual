# Notion - CampusVirtual UMA - Sync

Sincronización automática entre el campus virtual de la uma y tu base de datos en notion.

## Tabla de contenidos

- [Configurar Notion](#configurar-notion)
- [Variables de entorno](#variables-de-entorno)
  - [Definición de variables](#definición-de-variables)
  - [Obtener variables de entorno](#obtener-variables-de-entorno)
    - [CALENDAR_URL](#calendar_url)
    - [NOTION_API_KEY](#notion_api_key)
    - [NOTION_DATABASE_ID](#notion_database_id)
    - [SLEEP_TIME](#sleep_time)
- [Ejecutar contenedor](#ejecutar-contenedor)

## Configurar Notion

Las tareas se importarán a una base de datos de Notion, por lo que es necesario que esta tenga unos campos específicos.

Puedes usar esta [plantilla](https://miguedm.notion.site/a935199cb79341c29c043fa14716d61f?v=478c66d1354a47a28180f45ce807ab64) para clonar la base de datos o cambiar/añadir los campos necesarios en la tuya.

> Es importante que la base de datos tenga estos campos con el tipo y nombre correcto

## Variables de entorno

### Definición de variables

CALENDAR_URL: URL del calendario del campus virtual de la UMA.

NOTION_API_KEY: API key de notion.

NOTION_DATABASE_ID: ID de la base de datos de notion.

SLEEP_TIME: Tiempo de espera entre sincronizaciones(en segundos).

### Obtener variables de entorno

#### CALENDAR_URL

Ve al campus virtual de la UMA y copia la URL del calendario. Selecciona todos los eventos en un rango de 60 días.

![calendar_url](./docs/assets/url_campus.gif)

#### NOTION_API_KEY

Debes crear una integración en Notion para obtener la API key.
Una integración permite modificar datos de una página en Notion, si le das permiso, con un token de acceso.

Para ello sigue estos pasos:

- Ve a [Notion integrations](https://www.notion.so/my-integrations)
- Haz click en "Nueva integración"
- Dale un nombre a la integración
- El tipo de integración deber ser "Integración interna"
- Añade una foto si lo deseas y haz click en "Guardar"
- Accede a la integración, muestra el token y copialo

> Ese token será tu NOTION_API_KEY.

Una vez creada la integración, debes elegir la página que se podra modificar con esta.
Para ello, entra en Notion y accede a la página que quieras sincronizar.

Ve a "..." (parte superior derecha de la pantalla) > "Conectar con" > "nombre de tu integración"

> [!IMPORTANTE]
> Se tendrá acceso tanto a la página que vincules la integración como a las subpáginas de esta.

#### NOTION_DATABASE_ID

El ID de la base de datos de Notion se encuentra en la URL de la base de datos.
Solo se puede hacer desde la página web de Notion.
Accede a tu página de Notion en la que se encuentra tu base de datos.

La URL mostrará algo similar a esto:

> https://www.notion.so/username/NOTION_DATABASE_ID?v=...

Copia la sección NOTION_DATABASE_ID de la URL.

#### SLEEP_TIME

El sleeptime es el tiempo de espera entre sincronizaciones en segundos. Lo decides tú. Ten en cuenta que si pones un tiempo muy corto, notion puede bloquear tu cuenta.
No se recomienda poner un tiempo menor a 300 segundos(5 minutos).

## Ejecutar contenedor

Se recomienda crear un script para ejecutar el contenedor con las variables de entorno necesarias.
Si quieres tener una version estable usa --pull=missing. Si quieres tener la última versión de mi github usa --pull=always.

```bash
DBUS_PATH=$(echo $DBUS_SESSION_BUS_ADDRESS | cut -d= -f2-)
docker run -d \
	--name notion-sync-cv \
	--user $(id -u):$(id -g) \
	--pull=always \
	--restart=unless-stopped \
	-v $DBUS_PATH:$DBUS_PATH \
	-e DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS \
	-e CALENDAR_URL=TU_CALENDAR_URL \
	-e NOTION_API_KEY=TU_NOTION_API_KEY \
	-e NOTION_DATABASE_ID=TU_NOTION_DATABASE_ID \
	-e SLEEP_TIME=TU_SLEEP_TIME \
	migueel15/notion-sync-cv:latest
```
