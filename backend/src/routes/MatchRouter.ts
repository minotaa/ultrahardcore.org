import { Router } from 'express'
import bodyParser from 'body-parser'
import { authMiddleware } from '../middleware/UserMiddleware'
import Match from '../schemas/Match'
import Server from '../schemas/Server'
import Session from '../schemas/Session'
import User, { Member } from '../schemas/User'
import moment from 'moment'
import { customAlphabet } from 'nanoid'
import { ObjectId } from 'mongoose'

const nano = customAlphabet('1234567890abcdef', 10)
const MatchRouter = Router()
MatchRouter.use(bodyParser.json())

/*
  createdAt: Date,
  opensAt: Date,
  createdBy: String,
  removedBy: String,
  removedAt: Date,
  removedReason: String,
  removed: Boolean,
  mapSize: Number,
  pvpEnabledIn: Number,
  finalHealOccurs: Number,
  meetupOccursAt: Number,
  extraRules: Array,
  extraConfig: Object,
  scenarios: Array,
  hostCount: Number,
  displayName: String,
  serverIp: String,
  teamStyle: String,
  teamSize: Number,
  slots: Number,
  version: String
*/

MatchRouter.route('/upcoming').get(async (req, res) => {
  let matches = await Match.find({
    opensAt: {
      $gte: moment().subtract(15, "minutes").toDate()
    }
  }).exec()
  return res.json({
    success: true,
    matches: matches
  })
})

MatchRouter.route('/get').get(async (req, res) => {
  if (!req.query.match) return res.send('You did not provide a valid match ID.')
    let match = await Match.findOne({
      id: req.query.match
    }).exec()
  if (match) {
    return res.json({
      success: true,
      match: match
    })
  } else {
    return res.status(404).json({
      success: false,
      errors: ['Could not find match']
    })
  }
})

MatchRouter.route('/post').post(authMiddleware, async (req, res) => {
  let errors = []
  if (!req.body) errors.push("You need to provide a body")
  if (!req.body.server) errors.push("You need to provide a server")
  if (!req.body.createdBy) errors.push("You need to provide an author")
  if (!req.body.opensAt) errors.push("You need to provide an opening date")
  if (new Date(req.body.opensAt).toString() == "Invalid Date") errors.push("You need to provide a valid opening date")
  if (!req.body.mapSize) errors.push("You need to provide a border size")
  if (!req.body.pvpEnabledIn) errors.push("You need to provide a time at which PvP opens")
  if (isNaN(req.body.pvpEnabledIn)) errors.push("PvP time need to be a number")
  if (!req.body.finalHealOccurs) errors.push("You need to provide a time at which Final Heal occurs")
  if (isNaN(req.body.finalHealOccurs)) errors.push("Final Heal time need to be a number")
  if (!req.body.meetupOccursAt) errors.push("You need to provide a time Meetup occurs at")
  if (isNaN(req.body.meetupOccursAt)) errors.push("Meetup time need to be a number")
  if (!req.body.extraRules) errors.push("You need to provide an extra rules")
  if (!req.body.extraConfig) errors.push("You need to provide an extra config")
  if (!req.body.scenarios) errors.push("You need to provide a scenarios list")
  if (!req.body.teamSize) errors.push("You need to provide a team size")
  if (isNaN(req.body.teamSize)) errors.push("The team size needs to be a number")
  if (!req.body.teamStyle) errors.push("You need to provide a team style")
  if (!req.body.slots) errors.push("You need to provide slots")
  if (isNaN(req.body.slots)) errors.push("Slots need to be a number")
  if (req.body.slots < 2) errors.push("There needs to be more than one slot")
  if (!req.body.version) errors.push("You need to provide a version")
  if (!req.body.serverIp) errors.push("You need to provide a server IP")

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
  for (const member of server.members) {
    if ((member as Member).memberId == (user._id as ObjectId).toString()) {
      let match = new Match({
        createdAt: new Date(),
        opensAt: new Date(req.body.opensAt),
        createdBy: req.body.createdBy,
        removed: false,
        mapSize: req.body.mapSize,
        pvpEnabledIn: req.body.pvpEnabledIn,
        finalHealOccurs: req.body.finalHealOccurs,
        meetupOccursAt: req.body.meetupOccursAt,
        extraRules: req.body.extraRules,
        extraConfig: req.body.extraConfig,
        scenarios: req.body.scenarios,
        hostCount: req.body.hostCount,
        displayName: req.body.displayName,
        serverIp: req.body.serverIp,
        teamStyle: req.body.teamStyle,
        teamSize: req.body.teamSize,
        slots: req.body.slots,
        version: req.body.version,
        id: nano(),
        serverId: req.body.server
      })
      await match.save()
      return res.json({ 
        success: true,
        match: match
      })   
    }
  }
  return res.status(401).json({
    success: false,
    errors: ["You aren't a member of this server."]
  })
})

export default MatchRouter