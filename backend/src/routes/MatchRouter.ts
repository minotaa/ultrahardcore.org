import { Router } from 'express'
import bodyParser from 'body-parser'
import { authMiddleware } from 'src/middleware/UserMiddleware'
import Match from '../schemas/Match'

const MatchRouter = Router()
MatchRouter.use(bodyParser.json())

MatchRouter.route('/upcoming').get(authMiddleware, async (req, res) => {
  await Match.find({

  })
})

export default MatchRouter