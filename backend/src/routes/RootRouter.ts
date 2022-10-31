import { Router } from "express"
import bodyParser from 'body-parser'
import { logger } from "../index";

const RootRouter = Router()
RootRouter.use(bodyParser.json())

RootRouter.route('/').all((req, res) => {
    logger.info(`[/] Receiving request from ${req.socket.remoteAddress}.`)
    res.status(200).json({
        success: true,
        message: 'Hello World!'
    })
})

export default RootRouter