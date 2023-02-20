import { Router } from "express"
import bodyParser from 'body-parser'
import { logger } from "../index";
import { authMiddleware } from "../middleware/UserMiddleware";
import Server from "../schemas/Server";
import Session from "../schemas/Session";
import User, { Member } from "../schemas/User";
import { randomUUID } from "crypto";
import { approvedServerTemplate, createServerTemplate, deniedServerTemplate, sendMail } from "../utils/Mail";
import { ObjectId } from "mongoose";
import { updateLanguageServiceSourceFile } from "typescript";

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

ServerRouter.route('/getMember').get(authMiddleware, async(req, res) => {
  if (!req.query.server || !req.query.user) { 
    return res.status(403).json({
      success: false,
      errors: ['Please provide a server ID and user ID.']
    }) 
  }
  let user = await User.findOne({
    _id: req.query.user
  }).exec()
  let server = await Server.findOne({
    id: req.query.server
  })
  if (!server || !user) {
    return res.status(404).json({
      success: false,
      errors: ['You did not provide a valid server ID or user ID.']
    })
  }
  for (const member of server.members) {
    if ((member as Member).memberId == (user._id as ObjectId).toString()) {
      return res.json({
        success: true,
        member: member,
        user: {
          createdAt: user.createdAt,
          emailAddress: user.emailAddress,
          username: user.username,
          id: user.id,
          mId: user._id,
          role: user.role,
          banned: user.banned,
          bannedBy: user.bannedBy,
          bannedAt: user.bannedAt,
          bannedUntil: user.bannedUntil,
          servers: user.servers
        }
      })
    }
  }
  return res.json({
    success: false,
    errors: ['Member doesn\'t seem to be apart of that server.']
  })
})
 
ServerRouter.route('/deny').post(authMiddleware, async(req, res) => {
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
  if (!req.query.server) return res.json({
    success: false,
    errors: ['You did not provide a valid server ID.']
  })
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.json({
      success: false,
      errors: ['Invalid server']
    })
  }
  let owner = await User.findOne({
    _id: server.owner
  }).exec()
  if (owner) {
    await sendMail(
      owner.emailAddress, 
      'Your server has been denied!',
      deniedServerTemplate(owner.username, server.name)
    )
  }
  await server.remove()
  return res.json({
    success: true
  })
})

ServerRouter.route('/approve').post(authMiddleware, async(req, res) => {
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
  if (!req.query.server) return res.send('You did not provide a valid server ID.')
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.json({
      success: false,
      errors: ['Invalid server']
    })
  }
  server.verified = true
  let owner = await User.findOne({
    _id: server.owner
  }).exec()
  if (owner) {
    await sendMail(
      owner.emailAddress, 
      'Your server has been verified!',
      approvedServerTemplate(owner.username, server.name)
    )
  }
  await server.save()
  return res.json({
    success: true,
    server: server
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

ServerRouter.route('/denyInvite').post(authMiddleware, async (req, res) => {
  if (!req.query.server) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server ID']
    })
  }
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.status(404).json({
      success: false,
      errors: ['Invalid server']
    })
  }
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (server.invited.includes(user!!._id)) {
    let index = server.invited.indexOf(user!!._id)
    server.invited.splice(index, 1)
    server.invited = server.invited
    await server.save()
    return res.json({
      success: true,
      server: server
    })
  } else {
    return res.status(400).json({
      success: false,
      errors: ['You were not invited']
    })
  }
})

ServerRouter.route('/acceptInvite').post(authMiddleware, async (req, res) => {
  if (!req.query.server) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server ID']
    })
  }
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.status(404).json({
      success: false,
      errors: ['Invalid server']
    })
  }
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (server.invited.includes(user!!._id)) {
    let index = server.invited.indexOf(user!!._id)
    server.invited.splice(index, 1)
    server.invited = server.invited
    server.members.push({
      memberId: user!!._id,
      serverId: server.id,
      joinedAt: new Date(),
      role: "default"
    } as Member)
    await server.save()
    return res.json({
      success: true,
      server: server
    })
  } else {
    return res.status(400).json({
      success: false,
      errors: ['You were not invited']
    })
  }
})

ServerRouter.route('/invite').post(authMiddleware, async (req, res) => {
  if (!req.query.server) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server ID']
    })
  }
  if (!req.query.user) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid user ID']
    })
  }
  if (!req.query.server || !req.query.user) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server or user']
    })
  }
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.status(404).json({
      success: false,
      errors: ['Could not find server']
    })
  }
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  let invitee = await User.findOne({
    _id: req.query.user
  }).exec()
  if (!invitee) {
    return res.status(404).json({
      success: false,
      errors: ['Could not find invitee']
    })
  }
  if (user) {
    for (const member of server.members) {
      if ((member as Member).memberId == (invitee._id as ObjectId).toString()) {
        return res.status(203).json({
          success: true,
          errors: ["User is already in server"]
        })
      }
      if ((member as Member).memberId == (user._id as ObjectId).toString()) {
        if ((member as Member).role !== 'admin' && (member as Member).role !== 'owner') {
          return res.status(403).json({
            success: false,
            errors: ["You do not have permission"]
          })
        } else {
          if (!server.invited.includes(invitee._id)) {
            server.invited.push(invitee._id)
            await server.save()
            return res.json({
              success: true,
              errors: [`Successfully invited ${invitee.username}`]
            })
          } else {
            return res.json({
              success: true,
              errors: [`Successfully invited ${invitee.username}`]
            })
          }
        }
      } else {
        return res.status(400).json({
          success: false,
          errors: ["You are not in this server"]
        })
      }
    }
  }
})

ServerRouter.route('/edit').post(authMiddleware, async (req, res) => {
  if (!req.query.server) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server ID']
    })
  }
  if (!await req.body.server) {
    return res.status(403).json({
      success: false,
      errors: ['Invalid server']
    })
  }
  let server = await Server.findOne({
    id: req.query.server
  }).exec()
  if (!server) {
    return res.status(404).json({
      success: false,
      errors: ['Could not find server']
    })
  }
  let session = await Session.findOne({
    sessionString: req.get('Authorization')
  }).exec()
  if (!session) {
    return res.status(404).json({
      success: false,
      errors: ['Could not find session']
    })
  }
  let user = await User.findOne({
    _id: session.userId
  }).exec()
  if (!user) {
    return res.status(404).json({
      success: false,
      errors: ['Could not find user']
    })
  }
  if (server) {
    for (const member of server.members) {
      if ((member as Member).memberId == (user._id as ObjectId).toString()) {
        if ((member as Member).role !== 'admin' && (member as Member).role !== 'owner') {
          return res.status(403).json({
            success: false,
            errors: ['You have no permission']
          })
        }
        delete req.body.server._id
        delete req.body.server.__v
        server.remove()
        server = new Server(req.body.server)
        await server.save()
        return res.json({
          success: true,
          server: server
        })
      } else {
        return res.status(403).json({
          success: false,
          errors: ['You have no permission']
        })
      }
    }
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
  if (!req.body.ip) errors.push('You must provide an address or an IP')
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
    } as Member 
    user.servers.push(id)
    await user.save()
    let server = new Server({
      name: req.body.name,
      ip: req.body.ip,
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