import fs from 'fs'
import { pathToFileURL } from 'node:url'
import { UserData } from './types.js'
import { syncUser } from './sync.js'
import { logError, logInfo, logWarn } from './logger.js'

type SyncRunner = (user: UserData) => Promise<Awaited<ReturnType<typeof syncUser>> | void>

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

async function syncViaApi(user: UserData) {
	const response = await fetch(API_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	})
	const meta = { context: 'cron', databaseId: user.notiondatabaseid, status: response.status }

	if (response.ok) {
		await response.json()
		logInfo('Sync API returned a successful HTTP response', meta)
	} else {
		const error = await response.text()
		logError('User sync failed', { ...meta, responseText: error })
	}
}

async function syncAllUsers(sync: SyncRunner = syncViaApi) {
	const users = loadUsers()

	if (users.length === 0) {
		logInfo('No users found in configuration', { context: 'cron', configPath: USERS_FILE })
		return
	}

	logInfo('Starting sync for users', { context: 'cron', userCount: users.length })

	for (const user of users) {
		const meta = { context: 'cron', databaseId: user?.notiondatabaseid }
		try {
			const result = await sync(user)
			if (!result) continue
			if (result.eventsFailed > 0) {
				logWarn('User sync completed with event failures', { ...meta, ...result })
			} else {
				logInfo('User sync successful', { ...meta, ...result })
			}
		} catch (error) {
			logError('Error while syncing user', { ...meta, error })
		}
	}

	logInfo('Sync batch completed', { context: 'cron', userCount: users.length })
}

// Intervalo fijo en lugar de node-cron: su calculo de la siguiente ejecucion con
// zona horaria falla en el cambio de hora y dispara la tarea en bucle
const SYNC_INTERVAL_MS = 5 * 60 * 1000
function startSyncScheduler(sync: SyncRunner = syncViaApi) {
	let syncRunning = false
	setInterval(async () => {
		if (syncRunning) {
			logInfo('Previous sync still running, skipping scheduled sync', { context: 'cron' })
			return
		}
		syncRunning = true
		try {
			logInfo('Running scheduled sync', { context: 'cron' })
			await syncAllUsers(sync)
		} finally {
			syncRunning = false
		}
	}, SYNC_INTERVAL_MS)
	logInfo('Sync scheduled to run every 5 minutes', { context: 'cron', intervalMs: SYNC_INTERVAL_MS })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	startSyncScheduler()
}

export { startSyncScheduler, syncAllUsers }
