type LogLevel = 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown> & {
	context?: string
	error?: unknown
}

function serializeError(error: unknown) {
	if (error instanceof Error) {
		const { name, message, stack } = error
		return {
			name,
			message,
			stack,
			cause: (error as any).cause
		}
	}

	if (typeof error === 'object' && error !== null) {
		return error
	}

	return { message: String(error) }
}

function log(level: LogLevel, message: string, meta: LogMeta = {}) {
	const { error, ...rest } = meta

	const payload: Record<string, unknown> = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...rest
	}

	if (error !== undefined) {
		payload.error = serializeError(error)
	}

	const output = JSON.stringify(payload)

	if (level === 'error') {
		console.error(output)
		return
	}

	if (level === 'warn') {
		console.warn(output)
		return
	}

	console.log(output)
}

export function logInfo(message: string, meta?: LogMeta) {
	log('info', message, meta)
}

export function logWarn(message: string, meta?: LogMeta) {
	log('warn', message, meta)
}

export function logError(message: string, meta?: LogMeta) {
	log('error', message, meta)
}
