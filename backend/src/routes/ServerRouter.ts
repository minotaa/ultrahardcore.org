import { Router } from "express"
import bodyParser from 'body-parser'
import { logger } from "../index";
import { authMiddleware } from "../middleware/UserMiddleware";
import Server from "../schemas/Server";
import Session from "../schemas/Session";
import User, { UserServer } from "../schemas/User";
import { randomUUID } from "crypto";
import { createServerTemplate, sendMail } from "../utils/Mail";

const ServerRouter = Router()
ServerRouter.use(bodyParser.json())

const ADDRESS_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

ServerRouter.route('/getApprovableServers').get(authMiddleware, async(req, res) => {
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (user!!.role != "admin") {
    return res.json({
      success: false,
      errors: ['You are not an admin']
    })
  }
  let servers = await Server.find({
    verified: false
  })
  return res.json({
    success: true,
    servers: servers
  })
})

ServerRouter.route('/get').get(authMiddleware, async (req, res) => {
  if (!req.query.server) return res.send('You did not provide a valid server ID.')
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (server) {
    return res.json({
      success: true,
      server: server
    })
  } else {
    return res.status(404).json({
      success: false,
      errors: ['Could not find server']
    })
  }
})

ServerRouter.route('/create').post(authMiddleware, async (req, res) => {
  let errors = []
  if (!req.body.name) errors.push('You must provide a name')
  if (!req.body.ip && !req.body.address) errors.push('You must provide an address or an IP')
  if (req.body.address && !req.body.address.matches(ADDRESS_REGEX)) errors.push('You must provide a valid IP Address for your server')
  if (!req.body.region) errors.push('You must provide a server region')
  if (!req.body.location) errors.push('You must provide a server location')
  if (req.body.ip && req.body.ip.length < 6) errors.push('Your server domain must be greater than 5 characters')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors
    })
  }
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (user) {
    let id = randomUUID()
    let member = {
      memberId: user._id,
      joinedAt: new Date(),
      serverId: id,
      role: "owner"
    } as UserServer 
    user.servers.push(id)
    await user.save()
    let server = new Server({
      name: req.body.name,
      ip: req.body.ip || req.body.address,
      location: req.body.location,
      region: req.body.region,
      scenarioDescriptions: null,
      members: [member],
      createdAt: new Date(),
      owner: user._id,
      id: id,
      invited: [],
      verified: false
    })
    await sendMail(
      user.emailAddress, 
      'Successfully created server!',
      createServerTemplate(user.username)
    )
    logger.info(`[/servers] Successfully created the server ${server.id} for ${user.username}.`)
    await server.save()
    return res.json({
      success: true,
      message: 'Please await verification',
      server: server
    })
  }
})

export default ServerRouter