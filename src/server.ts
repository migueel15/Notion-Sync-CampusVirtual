import express from 'express'
import { syncUser } from './sync.js'
import { logError, logInfo } from './logger.js'
import { createSession, getSession, sanitizeSession } from './auth.js'
import { createSyncConfig, listSyncConfigs, runSyncConfig } from './syncConfig.js'
import { AuthSession, UserData } from './types.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.post('/auth/login', (req, res) => {
        const { provider } = req.body

        if (!provider) {
                return res.status(400).json({ error: 'Debes especificar un proveedor de autenticación' })
        }

        try {
                const session = provider === 'google'
                        ? createSession({
                                provider,
                                email: req.body.email,
                                googleAccessToken: req.body.googleAccessToken
                        })
                        : createSession({
                                provider,
                                email: req.body.email,
                                notionApiKey: req.body.notionApiKey,
                                notionDatabaseId: req.body.notionDatabaseId
                        })

                res.status(201).json({ sessionId: session.id, session: sanitizeSession(session) })
        } catch (error) {
                logError('Error creando la sesión de usuario', { context: 'auth', provider, error })
                res.status(400).json({ error: error instanceof Error ? error.message : 'No se pudo crear la sesión' })
        }
})

app.get('/auth/session', (req, res) => {
        const session = resolveSession(req, res)

        if (!session) {
                return
        }

        res.json({ session: sanitizeSession(session) })
})

app.post('/sync-configs', (req, res) => {
        const session = resolveSession(req, res)

        if (!session) {
                return
        }

        try {
                        const config = createSyncConfig(session, req.body)
                        res.status(201).json({ config })
        } catch (error) {
                        logError('Error creando configuración de sincronización', { context: 'sync-config', error })
                        res.status(400).json({
                                error: error instanceof Error ? error.message : 'No se pudo crear la configuración'
                        })
        }
})

app.get('/sync-configs', (req, res) => {
        const session = resolveSession(req, res)

        if (!session) {
                return
        }

        const configs = listSyncConfigs(session)
        res.json({ configs })
})

app.post('/sync-configs/:id/run', async (req, res) => {
        const session = resolveSession(req, res)

        if (!session) {
                return
        }

        try {
                await runSyncConfig(session, req.params.id)
                res.json({ success: true })
        } catch (error) {
                res.status(400).json({
                        error: error instanceof Error ? error.message : 'No se pudo ejecutar la sincronización'
                })
        }
})

app.post('/sync-user', async (req, res) => {
        let userData: UserData | undefined

	try {
		userData = req.body

		if (!userData.notionapikey || !userData.notiondatabaseid || !userData.calendarurl) {
			return res.status(400).json({ 
				error: 'Missing required fields: notionapikey, notiondatabaseid, calendarurl' 
			})
		}

		await syncUser(userData)

		res.json({ 
			success: true, 
			message: 'User sync completed successfully',
			database: userData.notiondatabaseid
		})
		logInfo('User sync completed via API', { context: 'api', databaseId: userData.notiondatabaseid })
	} catch (error) {
		logError('Error in sync-user endpoint', { context: 'api', databaseId: userData?.notiondatabaseid, error })
		res.status(500).json({ 
			error: 'Internal server error', 
			details: error instanceof Error ? error.message : 'Unknown error'
		})
        }
})

function resolveSession(req: express.Request, res: express.Response): AuthSession | undefined {
        const sessionId = req.header('x-session-id')
        const session = getSession(sessionId)

        if (!session) {
                res.status(401).json({ error: 'Sesión no encontrada o expirada' })
                return undefined
        }

        return session
}

app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
	logInfo('Server running', { context: 'api', port: PORT })
})

export default app
