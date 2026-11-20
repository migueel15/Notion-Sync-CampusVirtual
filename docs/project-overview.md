# Funcionamiento y registros

El servicio lee el calendario ICS de Campus Virtual y sincroniza los eventos con Notion mediante el campo `cv-id`. La propiedad `Asignatura` es de tipo select. Se aplica el mapeo configurado y se sustituyen las comas de la etiqueta por puntos medios separados por espacios. Los eventos sin categoría reciben la asignatura `Sin asignar`.

`npm run build` compila el servicio y `npm start` inicia la API y la sincronización periódica. El cron lee los usuarios de `users.json` en el directorio indicado por `CONFIG_PATH` (por defecto, `/config`).

Si falla un alta, una actualización o un archivado, se registra el error con el identificador del evento y se continúa con los demás. El resumen incluye `eventsProcessed` para los eventos completados, incluidos los que ya estaban al día, y `eventsFailed` para los que fallaron. Cuando hay fallos, el resumen se registra con nivel `warn`.

`POST /sync-user` conserva su respuesta HTTP 200 habitual cuando la ejecución termina con fallos individuales. La API registra el resultado parcial. El cron integrado también registra los contadores. Si se ejecuta el cron por separado con `npm run cron` o se configura `API_ENDPOINT`, el cron registra el estado HTTP y los contadores quedan en los registros del servidor que atendió la petición.
