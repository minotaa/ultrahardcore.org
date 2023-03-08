import { Router } from 'express'
import bodyParser from 'body-parser'
import { authMiddleware } from '../middleware/UserMiddleware'
import Match from '../schemas/Match'
import Server from '../schemas/Server'
import Session from '../schemas/Session'
import User from '../schemas/User'

const MatchRouter = Router()
const cachedMatches = []
MatchRouter.use(bodyParser.json())

MatchRouter.route('/upcoming').get(authMiddleware, async (req, res) => {
  let matches = await Match.find({
    opensAt: {
      $gte: new Date()
    }
  }).exec()
})

/*
  createdAt: Date,
  opensAt: Date,
  createdBy: String,
  removedBy: String,
  removedAt: Date,
  removedReason: String,
  removed: Boolean,
  mapSize: Number,
  pvpEnabledAt: Number,
  finalHealAt: Number,
  meetupAt: Number,
  extraRules: Array,
  extraConfig: Object,
  scenarios: Array,
  count: Number,
  displayName: String,
  serverIp: String
*/

MatchRouter.route('/post').post(authMiddleware, async (req, res) => {
  let errors = []
  if (!req.body) errors.push("You need to provide a body")
  if (!req.body.server) errors.push("You need to provide a server")
  /*    opensAt: req.body.opensAt,
    createdBy: user._id,
    removed: false,
    mapSize: req.body.mapSize,
    pvpEnabledAt: req.body.pvpEnabledIn,
    finalHealAt: req.body.finalHealOccurs,
    meetupAt: req.body.meetupOccursAt,
    extraRules: req.body.extraRules,
    extraConfig: req.body.extraOptions,
    scenarios: req.body.scenarios,
    count: req.body.count,
    displayName: req.body.displayName,
    serverIp: req.body.serverIp*/
  if (!req.body.opensAt) errors.push("You need to provide an opensAt date")
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors
    })
  }
  let server = await Server.findOne({
    id: req.body.server
  }).exec()
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: "huh"
    })
  }
  if (!server) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: "You need to provide a valid server"
    })
  }
  let match = new Match({
    createdAt: new Date(),
    opensAt: req.body.opensAt,
    createdBy: user._id,
    removed: false,
    mapSize: req.body.mapSize,
    pvpEnabledAt: req.body.pvpEnabledIn,
    finalHealAt: req.body.finalHealOccurs,
    meetupAt: req.body.meetupOccursAt,
    extraRules: req.body.extraRules,
    extraConfig: req.body.extraOptions,
    scenarios: req.body.scenarios,
    count: req.body.count,
    displayName: req.body.displayName,
    serverIp: req.body.serverIp
  })
})

export default MatchRouter