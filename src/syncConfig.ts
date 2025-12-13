import { randomUUID } from 'crypto'
import { logError, logInfo } from './logger.js'
import { runIcsSync } from './syncRunner.js'
import { AuthSession, SyncConfig, SyncRequest } from './types.js'

const syncConfigs: SyncConfig[] = []

export function createSyncConfig(session: AuthSession, request: SyncRequest): SyncConfig {
        validateSyncRequest(session, request)

        const config: SyncConfig = {
                        id: randomUUID(),
                        ownerSessionId: session.id,
                        name: request.name,
                        icsUrl: request.icsUrl,
                        destination: request.destination,
                        notionDatabaseId: request.notionDatabaseId ?? session.notionDatabaseId,
                        googleCalendarId: request.googleCalendarId,
                        createdAt: new Date().toISOString()
        }

        syncConfigs.push(config)
        logInfo('Nueva configuración de sync creada', { context: 'sync-config', destination: config.destination, owner: session.email ?? session.id })
        return config
}

function validateSyncRequest(session: AuthSession, request: SyncRequest): void {
        if (!request.name || !request.icsUrl) {
                throw new Error('Faltan el nombre o la URL del calendario ICS')
        }

        if (request.destination === 'notion') {
                if (!session.notionApiKey || !(request.notionDatabaseId || session.notionDatabaseId)) {
                        throw new Error('La sesión de Notion debe tener API key y base de datos configurada')
                }
        }

        if (request.destination === 'google-calendar') {
                if (session.provider !== 'google') {
                        throw new Error('Solo un usuario autenticado con Google puede sincronizar con Google Calendar')
                }

                if (!request.googleCalendarId) {
                        throw new Error('Debes indicar el ID del calendario de Google')
                }
        }
}

export function listSyncConfigs(session: AuthSession): SyncConfig[] {
        return syncConfigs
                .filter((config) => config.ownerSessionId === session.id)
                .map((config) => ({ ...config }))
}

export async function runSyncConfig(session: AuthSession, syncId: string): Promise<void> {
        const config = syncConfigs.find((entry) => entry.id === syncId && entry.ownerSessionId === session.id)

        if (!config) {
                throw new Error('No existe una configuración con ese ID para el usuario actual')
        }

        try {
                await runIcsSync(session, config)
                config.lastRunAt = new Date().toISOString()
        } catch (error) {
                logError('Error al ejecutar la sincronización', { context: 'sync-config', syncId, error })
                throw error
        }
}
