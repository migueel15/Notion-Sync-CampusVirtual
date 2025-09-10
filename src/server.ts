import express from 'express'
import { syncUser } from './sync.js'
import { UserData } from './types.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.post('/sync-user', async (req, res) => {
	try {
		const userData: UserData = req.body

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
	} catch (error) {
		console.error('Error in sync-user endpoint:', error)
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
	console.log(`Server running on port ${PORT}`)
})

export default app