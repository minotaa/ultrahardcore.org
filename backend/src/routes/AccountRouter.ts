import { Router } from 'express'
import argon2, { argon2id } from 'argon2'
import crypto from 'crypto'
import User from '../schemas/User'
import Session from '../schemas/Session'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import bodyParser from 'body-parser'
import { authMiddleware } from '../middleware/UserMiddleware'
import { sendEmailVerification, sendMail, verifyEmailSuccessTemplate } from '../utils/Mail'
import { logger } from '../index'

const AccountRouter = Router()
AccountRouter.use(bodyParser.json())

const usernameRegex = /^[a-z0-9]+$/i
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

AccountRouter.route('/').all(authMiddleware, (req, res) => {
  res.status(200).json({
    status: 200,
    route: '/account',
    message: 'Hello World!'
  })
})

/*({
  createdAt: Date,
  emailAddress: String,
  username: String,
  password: String,
  id: String,
  role: String,
  banned: Boolean,
  bannedBy: String,
  bannedAt: String,
  bannedUntil: Number,
  servers: Object,
  verificationToken: String,
  emailVerified: Boolean
})*/

AccountRouter.route('/get').get(authMiddleware, async (req, res) => {
  let session = await Session.findOne({
    sessionString: req.get(`Authorization`)
  }).exec()
  let user = await User.findOne({
    _id: session!!.userId
  }).exec()
  if (user) {
    return res.json({
      success: true,
      user: {
        createdAt: user.createdAt,
        emailAddress: user.emailAddress,
        username: user.username,
        id: user.id,
        role: user.role,
        banned: user.banned,
        bannedBy: user.bannedBy,
        bannedAt: user.bannedAt,
        bannedUntil: user.bannedUntil,
        servers: user.servers
      }
    })
  } 
})

AccountRouter.route('/login').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('You must supply a body')
  if (!req.body.username) errors.push('You must supply a username')
  if (!req.body.password) errors.push('You must supply a password')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors,
    })
  }
  let user = await User.findOne({
    [req.body.username.includes('@')
      ? 'emailAddress'
      : 'username']: req.body.username.toLowerCase()
  }).exec()
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: ['Username or password is invalid'],
    })
  }
  if (!user.emailVerified) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: ['You are not email verified yet'],
    })
  }
  let passwordValid = await argon2.verify(user.password, req.body.password, {
    type: argon2id,
  })
  if (!passwordValid) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors: ['Username or password is invalid'],
    })
  }
  let now = moment()
  let sessionToken = 'Bearer ' + crypto.randomBytes(96).toString('base64')
  let session = new Session({
    sessionString: sessionToken,
    userId: user._id,
    ip: req.ip,
    rememberMe: false,
    expiresAt: now
      .add(8, req.body.rememberMe ? 'days' : 'hours')
      .toDate()
  })
  await session.save()
  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    session: sessionToken,
    user: user._id
  })
})

AccountRouter.route('/verify').get(async (req, res) => {
  if (!req.query.token) return res.send('You did not provide an email verification token.')
  let user = await User.findOne({
    verificationToken: req.query.token,
    emailVerified: false, 
  }).exec()
  if (!user) return res.send('Could not find a user with that verification key. Perhaps your account is already verified?')
  user.emailVerified = true
  await sendMail(
    user.emailAddress, 
    'Your email was successfully verified, thank you for using our service!',
    verifyEmailSuccessTemplate(user.username)
  )
  logger.info(`[/accounts] Successfully verified the email ${user.emailAddress} (${user.username}).`)
  await user.save()
  return res.redirect(`${process.env.FRONTEND_URL}/login`)
})


AccountRouter.route('/register').post(async (req, res) => {
  let errors = []
  if (!req.body) errors.push('No body')
  if (!req.body.username == null) errors.push('You must supply a username')
  //if (!req.body.tosCheck) errors.push('You must agree to the Terms of Service')
  let username = req.body.username
  if (req.body.email == null) errors.push('You must supply a email')
  if (req.body.password == null) errors.push('You must supply a password')
  if (req.body.confirmPassword == null) errors.push('You must supply a confirmation password')
  if (req.body.confirmPassword !== req.body.password) errors.push('The confirmation password must match your password.')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors
    })
  }
  if (!req.body.username.match(usernameRegex)) errors.push('Your username must be alphanumeric')
  if (username.length <= 2) errors.push('Your username\'s too short.')
  if (!req.body.email.match(emailRegex)) errors.push('Your email is invalid')
  let emails = await User.find({
    email: req.body.email,
  }).exec()
  let usernames = await User.find({
    name: req.body.username,
  }).exec()
  if (usernames.length > 0) errors.push('This username is already in use')
  if (emails.length > 0) errors.push('This email is already in use')
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'errors',
      errors
    })
  }
  const hashedPassword = await argon2.hash(req.body.password, {
    type: argon2id,
  })
  let user = new User({
    createdAt: new Date(),
    emailAddress: req.body.email,
    password: hashedPassword,
    username: req.body.username,
    id: uuidv4(),
    role: 'default',
    emailVerified: false,
    minecraftVerified: false,
    verificationToken: crypto.randomBytes(18).toString('hex'),
    minecraftToken: crypto.randomBytes(6).toString('hex'),
    servers: []
  }) 
  res.status(200).json({
    success: true,
    message: 'Check your email for more information.'
  })
  await sendEmailVerification(
    user.emailAddress,
    user.username,
    `${process.env.BASE_URL}/account/verify?token=${user.verificationToken}`
  )
  logger.info(`[/accounts] Created an account with the email ${user.emailAddress} & username ${user.username}.`)
  await user.save()
})

export default AccountRouter