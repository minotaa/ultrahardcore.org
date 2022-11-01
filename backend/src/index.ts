import 'dotenv/config'
import { RootRouter } from './routes'
import express from 'express'
import kleur from 'kleur'
import cors from 'cors'
import db from './database'

import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, printf } = format

const f = printf(({ level, message, label, timestamp }) => {
    return `[${kleur.bold().yellow(label)}] ${kleur.blue(timestamp)} ${kleur.yellow(level)}: ${message}`
})

export const logger = createLogger({
  format: combine(
    label({ label: 'backend' }),
    timestamp(),
    f
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: `logs/${new Date().getTime()}.log` })
  ]
})

const app = express()
new db()

app.use(cors())
app.use('/', RootRouter)

app.listen(process.env.SERVER_PORT, () => logger.info(`Listening on port ${process.env.SERVER_PORT}.`))