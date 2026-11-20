import express from 'express'
import { syncUser } from './sync.js'
import { UserData } from './types.js'
import { logError, logInfo, logWarn } from './logger.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.post('/sync-user', async (req, res) => {
	let userData: UserData | undefined

	try {
		userData = req.body

		if (!userData.notionapikey || !userData.notiondatabaseid || !userData.calendarurl) {
			return res.status(400).json({ 
				error: 'Missing required fields: notionapikey, notiondatabaseid, calendarurl' 
			})
		}

		const result = await syncUser(userData)

		res.json({ 
			success: true, 
			message: 'User sync completed successfully',
			database: userData.notiondatabaseid
		})
		const meta = { context: 'api', databaseId: userData.notiondatabaseid, ...result }
		if (result.eventsFailed > 0) {
			logWarn('User sync via API completed with event failures', meta)
		} else {
			logInfo('User sync completed via API', meta)
		}
	} catch (error) {
		logError('Error in sync-user endpoint', { context: 'api', databaseId: userData?.notiondatabaseid, error })
		res.status(500).json({ 
			error: 'Internal server error', 
			details: error instanceof Error ? error.message : 'Unknown error'
		})
	}
})

app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
	logInfo('Server running', { context: 'api', port: PORT })
})

export default app
