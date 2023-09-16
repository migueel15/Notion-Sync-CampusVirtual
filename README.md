# Notion - CampusVirtual UMA - Sync

Sincronización automática entre el campus virtual de la uma y tu base de datos en notion.

![captura_20230916-035041](https://github.com/migueel15/dotfiles/assets/57865265/653d9b61-a0b4-49e5-b74b-45fb571777b7)
![captura_20230916-035122](https://github.com/migueel15/dotfiles/assets/57865265/9c7bc9cd-05d4-466b-8c36-2d22ae499cfe)

## Características

¿Qué obtiene del campus virtual?

- Recoge las tareas en un rango (4 días previos - 60 próximos días)
- Crea, actualiza y elimina las tareas en notion

¿Qué obtiene de notion?

- Recoge las tareas en un rango (4 días previos - 60 próximos días) que tenga como propiedad que provienen del CV. No accede al resto de datos

## Requisitos

Para que la aplicación pueda funcionar deberá de disponer de:

- Cuenta de notion
- Cuenta de la uma(campus virtual)
- NodeJS (v18.17.0 +, no aseguro que funcione con versiones más antiguas)
- Notion API KEY
- Notion Database ID
- URL del calendario del CV

## Instrucciones

Clona el repositorio y acceda a él.
`npm install`
Crea un archivo .env como en el ejemplo
Necesitarás tres keys:

- Notion API KEY: Notion > Configuración > Conexiones > Desarrolla o maneja integraciones > Crea una nueva integración > Copia el token al guardar
  Añade ese valor a la key nombrada. Esta integración permite al script acceder a los datos para actualizarlos. Para ello en la página de la base de datos que quieras utilizar, arriba a la derecha en los 3 puntos, añade integraciones y selecciona la creada. De esta forma el script tendra acceso a esa página solo. Si esta página es carpeta de otras el permiso se aplicará de forma recursiva al resto.
- Notion Database ID: Debe seleccionar que base de datos se utilizará para manejar las tareas. Para ello accede a notion desde internet. Accede a la página de la base de datos y en la URL verás detrás de ?v= una cadena de letras y números. Copiala y añadela a su key.
- URL del calendario del CV: Para obtener esta URl tendrás que ir al calendario del campus virtual de la UMA. Al iniciar sesión en el campus te aparecerá a las derecha el mes actual. Haz click en el nombre del mes. Debajo del mes verás el botón "Exportar Calendario". Accede a él, selecciona todos los eventos que tu quieras y en el periodo de tiempo selecciona "Los últimos y los siguientes 60 días". Pincha sobre "obtener URL" y te mostrará un cuadro de texto. Copia la ruta empezando por https:// y pegala en el archivo .env en su respectiva key.

Una vez guardadas las tres variables es importante que tu base de datos tenga unas propiedades especificas para que el script pueda funcionar. En un futuro haré que se puedan personalizar.

(Nombre -> Tipo de dato)

- "Nombre de tarea" -> Title
- "Fecha" -> Date
- "Descripcion" -> Text
- "From" -> Select
- "cv-id" -> Text
- "Asignatura" -> Select

## Configuración del nombre de la asignatura

Para las asignaturas por defecto coge el nombre de la asignatura que aparece en las tareas del campus virtual. Estos nombres suelen ser largos. En el archivo subjects.js hay una lista de asignaturas. El valor de la izquierda representa la palabra que busca en ese nombre largo(puede ser una parte de él ya que busco que esta cadena de texto se encuentre en el nombre de la asignatura) y el valor de la derecha es en el que es convertido. De esta forma podemos formatear el nombre de la asignatura para convertirlo en algo más corto y personalizado. En caso de que no encuentre ningún valor de la lista simplemente creará la tarea con el nombre largo en el apartado de Asignatura. Si no sabes que nombre largo tiene lo más fácil es esperar a que una tarea de esa asignatura sea creada. Mira el campo Asignatura y crea en la lista de subjects.js (con el mismo formato), a la izq ese nombre o parte de él(las mayus importan) y a la derecha el valor en el que quieres que se formatée. Borra la tarea y corre de nuevo el script y verás como ahora la asignatura tiene el nombre que quieres. Para las próximas tareas de la asignatura funcionará automáticamente.

## Ejecución del programa

Ejecuta npm run start para que el script se ejecute y listo. Ya tendrás tus tareas del campus en el calendario de notion.

Un detalle a tener en cuenta. La api de notion solo devuelve como máximo una lista de 100 elementos. Si tiene más de 100 elementos entre el rango de tiempo que se utiliza no se mostrarán todas. (Para un futuro pondré una opcion de flujo alto de tareas, aunque obviamente aumentará el tiempo de recogida de datos)

## Automatización

Si quieres que el script se corra de forma automática esto dependerá del sistema operativo.
Si usas linux puedes usar cron para ello.
Si usas windows utiliza el programador de tareas "https://www.youtube.com/watch?v=CJw_JEt_L6I"
