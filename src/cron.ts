import cron from 'node-cron'
import fs from 'fs'
import { UserData } from './types.js'
import { logError, logInfo } from './logger.js'

// const USERS_FILE = path.join(process.cwd(), 'src/users.json')
const USERS_CONFIG_DIR = process.env.CONFIG_PATH || '/config'
const USERS_FILE = `${USERS_CONFIG_DIR}/users.json`
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000/sync-user'

function loadUsers(): UserData[] {
	try {
		const data = fs.readFileSync(USERS_FILE, 'utf-8')
		const parsed = JSON.parse(data)
		logInfo('Loaded users configuration', { context: 'cron', configPath: USERS_FILE, userCount: parsed.length })
		return parsed
	} catch (error) {
		logError('Error loading users.json', { context: 'cron', configPath: USERS_FILE, error })
		return []
	}
}

async function syncAllUsers() {
	const users = loadUsers()

	if (users.length === 0) {
		logInfo('No users found in configuration', { context: 'cron', configPath: USERS_FILE })
		return
	}

	logInfo('Starting sync for users', { context: 'cron', userCount: users.length })

	for (const user of users) {
		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(user)
			})

			if (response.ok) {
				const result = await response.json()
				logInfo('User sync successful', { context: 'cron', databaseId: user.notiondatabaseid })
			} else {
				const error = await response.text()
				logError('User sync failed', { context: 'cron', databaseId: user.notiondatabaseid, status: response.status, responseText: error })
			}
		} catch (error) {
			logError('Network error while syncing user', { context: 'cron', databaseId: user.notiondatabaseid, error })
		}
	}

	logInfo('Sync batch completed', { context: 'cron', userCount: users.length })
}

cron.schedule('*/5 * * * *', () => {
	logInfo('Running scheduled sync', { context: 'cron' })
	syncAllUsers()
}, {
	timezone: "Europe/Madrid"
})

logInfo('Cron job scheduled to run every 5 minutes', { context: 'cron', schedule: '*/5 * * * *', timezone: 'Europe/Madrid' })

export { syncAllUsers }
