import { getCvEvents } from "./ical.js";
import dotenv from "dotenv"
import { queryEventsFromNotion } from "./notion.js";
dotenv.config()

const cvE = await getCvEvents()
const notionE = await queryEventsFromNotion()
console.log(cvE)
console.log(notionE)
