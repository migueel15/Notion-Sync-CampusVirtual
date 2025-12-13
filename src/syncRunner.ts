import { logInfo } from './logger.js'
import { syncUser } from './sync.js'
import { AuthSession, SyncConfig } from './types.js'

export async function runIcsSync(session: AuthSession, config: SyncConfig): Promise<void> {
        logInfo('Ejecutando sincronización personalizada', {
                context: 'sync-runner',
                destination: config.destination,
                icsUrl: config.icsUrl,
                session: session.id
        })

        if (config.destination === 'notion') {
                const notionApiKey = session.notionApiKey
                const notionDatabaseId = config.notionDatabaseId ?? session.notionDatabaseId

                if (!notionApiKey || !notionDatabaseId) {
                        throw new Error('Faltan credenciales de Notion para ejecutar la sincronización')
                }

                await syncUser({
                        notionapikey: notionApiKey,
                        notiondatabaseid: notionDatabaseId,
                        calendarurl: config.icsUrl
                })
                return
        }

        logInfo('Sincronización con Google Calendar aún no implementada', {
                context: 'sync-runner',
                calendarId: config.googleCalendarId
        })
}
