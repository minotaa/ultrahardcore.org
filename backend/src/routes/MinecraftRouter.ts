import { Router } from "express"
import bodyParser from 'body-parser'
import { logger } from "../index";
import 'dotenv/config'
import { mcMiddleware } from "../middleware/MinecraftMiddleware";
import User from "../schemas/User";
import { sendMail, verifyEmailSuccessTemplate } from "../utils/Mail";

const MinecraftRouter = Router()
MinecraftRouter.use(bodyParser.json())

MinecraftRouter.route('/').all(mcMiddleware, (req, res) => {
  logger.info(`[/minecraft] Receiving request from ${req.socket.remoteAddress}.`)
  res.status(200).json({
    success: true,
    message: 'Hello World!'
  })
})

MinecraftRouter.route('/verify').get(mcMiddleware, async (req, res) => {
  // req.query.uuid
  // req.query.username
  // req.query.token
  let user = await User.findOne({
    minecraftToken: req.query.token,
    minecraftVerified: false, 
  }).exec()
  if (!user) return res.status(400).json({
    success: false,
    message: 'Could not find a user with that verification key. Perhaps your account is already verified?'
  })
  user.minecraftVerified = true
  user.minecraftUuid = req.query.uuid
  await sendMail(
    user.emailAddress, 
    `Your Minecraft account (${req.query.uuid}) was successfully linked, thank you for using our service!`,
    verifyEmailSuccessTemplate(user.username)
  )
  logger.info(`[/minecraft] Successfully verified the Minecraft account ${req.query.username} (${req.query.uuid}).`)
  await user.save()
  return res.status(200).json({
    success: true,
    message: 'Your Minecraft account was successfully verified!'
  })
})


export default MinecraftRouter