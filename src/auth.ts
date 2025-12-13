import { randomUUID } from 'crypto'
import { AuthSession, GoogleAuthPayload, NotionAuthPayload } from './types.js'
import { logError, logInfo } from './logger.js'

const sessions = new Map<string, AuthSession>()

export function createSession(payload: GoogleAuthPayload | NotionAuthPayload): AuthSession {
        const sessionId = randomUUID()
        const createdAt = new Date().toISOString()

        if (payload.provider === 'google') {
                const { email, googleAccessToken } = payload

                if (!email || !googleAccessToken) {
                        logError('Missing Google auth details', { context: 'auth', email })
                        throw new Error('Faltan el email o el token de Google')
                }

                const session: AuthSession = {
                        id: sessionId,
                        provider: payload.provider,
                        email,
                        googleAccessToken,
                        createdAt
                }

                sessions.set(sessionId, session)
                logInfo('Google session created', { context: 'auth', email })
                return session
        }

        const { notionApiKey, notionDatabaseId, email } = payload

        if (!notionApiKey || !notionDatabaseId) {
                logError('Missing Notion auth details', { context: 'auth', email })
                throw new Error('Faltan la API key o el ID de base de datos de Notion')
        }

        const session: AuthSession = {
                id: sessionId,
                provider: payload.provider,
                email,
                notionApiKey,
                notionDatabaseId,
                createdAt
        }

        sessions.set(sessionId, session)
        logInfo('Notion session created', { context: 'auth', email })
        return session
}

export function getSession(sessionId: string | undefined): AuthSession | undefined {
        if (!sessionId) {
                return undefined
        }

        return sessions.get(sessionId)
}

export function sanitizeSession(session: AuthSession): AuthSession {
        const sanitized: AuthSession = { ...session }

        if (sanitized.googleAccessToken) {
                sanitized.googleAccessToken = '***'
        }

        if (sanitized.notionApiKey) {
                sanitized.notionApiKey = '***'
        }

        return sanitized
}
