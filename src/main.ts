import { Client, isFullPage } from "@notionhq/client"

import dotenv from "dotenv"
import { getCvEvents } from "./ical.js"
dotenv.config()
const notion = new Client({ auth: process.env.NOTION_API_KEY })

const events = await getCvEvents()

console.log(events)

