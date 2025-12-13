export type State = "CREATED" | "UPDATED" | "DELETED" | "ERROR"

export type DateOffsetRange = {
	startOffset: number
	endOffset: number
}

export type DateRange = {
	minDate: string
	maxDate: string
}

export type Evento = {
        id: string
        title: string
        from: string
        description?: string
	UTCStart: string
	UTCEnd?: string
	subject?: string
	notion_id?: string
}

export type NotionPropertieLabels = {
	nombre: string
	asignatura: string
	descripcion: string
	fecha: string
	from: string
	cv: string
	tipo: string
}

export type UserData = {
        notionapikey: string
        notiondatabaseid: string
        calendarurl: string
}

export type AuthProvider = 'google' | 'notion'

export type AuthSession = {
        id: string
        provider: AuthProvider
        email?: string
        googleAccessToken?: string
        notionApiKey?: string
        notionDatabaseId?: string
        createdAt: string
}

export type GoogleAuthPayload = {
        provider: 'google'
        email: string
        googleAccessToken: string
}

export type NotionAuthPayload = {
        provider: 'notion'
        notionApiKey: string
        notionDatabaseId: string
        email?: string
}

export type SyncDestination = 'notion' | 'google-calendar'

export type SyncRequest = {
        name: string
        icsUrl: string
        destination: SyncDestination
        notionDatabaseId?: string
        googleCalendarId?: string
}

export type SyncConfig = {
        id: string
        ownerSessionId: string
        name: string
        icsUrl: string
        destination: SyncDestination
        notionDatabaseId?: string
        googleCalendarId?: string
        createdAt: string
        lastRunAt?: string
}
