import cron from 'node-cron'
import fs from 'fs'
import path from 'path'
import { UserData } from './types.js'

// const USERS_FILE = path.join(process.cwd(), 'src/users.json')
const USERS_CONFIG_DIR = process.env.CONFIG_PATH || '/config'
const USERS_FILE = `${USERS_CONFIG_DIR}/users.json`
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000/sync-user'

function loadUsers(): UserData[] {
	try {
		const data = fs.readFileSync(USERS_FILE, 'utf-8')
		console.log(JSON.parse(data).length)
		return JSON.parse(data)
	} catch (error) {
		console.error('Error loading users.json:', error)
		return []
	}
}

async function syncAllUsers() {
	const users = loadUsers()

	if (users.length === 0) {
		console.log('No users found in users.json')
		return
	}

	console.log(`Starting sync for ${users.length} users at ${new Date().toISOString()}`)

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
				console.log(`✅ User sync successful for database: ${user.notiondatabaseid}`)
			} else {
				const error = await response.text()
				console.error(`❌ User sync failed for database: ${user.notiondatabaseid}`, error)
			}
		} catch (error) {
			console.error(`❌ Network error for database: ${user.notiondatabaseid}`, error)
		}
	}

	console.log(`Sync batch completed at ${new Date().toISOString()}`)
}

cron.schedule('*/5 * * * *', () => {
	console.log('🔄 Running scheduled sync...')
	syncAllUsers()
}, {
	timezone: "Europe/Madrid"
})

console.log('Cron job scheduled to run every 5 minutes')
console.log('Next execution times:')
console.log('- Every 5 minutes: */5 * * * *')

export { syncAllUsers }
